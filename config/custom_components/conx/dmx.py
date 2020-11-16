# region imports
import time
import socket
import logging
import threading
from struct import pack
from timeit import default_timer as timer
from homeassistant.core import HomeAssistant
from homeassistant.const import CONF_NAME, CONF_TYPE, STATE_ON, STATE_OFF

from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ATTR_HS_COLOR,
    ATTR_RGB_COLOR,
    LightEntity,
    PLATFORM_SCHEMA,
    SUPPORT_BRIGHTNESS,
    SUPPORT_COLOR,
)
from homeassistant.util.color import color_rgb_to_rgbw
import homeassistant.util.color as color_util


from .db import DB
from .const import DOMAIN, EVENT_UNIVERSE_CHANGE

# endregion

# region defines
_LOGGER = logging.getLogger(__name__)

# Light types
CONF_LIGHT_TYPE_DIMMER = "dimmer"
CONF_LIGHT_TYPE_RGB = "rgb"
CONF_LIGHT_TYPE_RGBA = "rgba"
CONF_LIGHT_TYPE_SWITCH = "switch"
CONF_LIGHT_TYPES = [
    CONF_LIGHT_TYPE_DIMMER,
    CONF_LIGHT_TYPE_RGB,
    CONF_LIGHT_TYPE_RGBA,
    CONF_LIGHT_TYPE_SWITCH,
]

# Number of channels used by each light type
CHANNEL_COUNT_MAP, FEATURE_MAP = {}, {}
CHANNEL_COUNT_MAP[CONF_LIGHT_TYPE_DIMMER] = 1
CHANNEL_COUNT_MAP[CONF_LIGHT_TYPE_RGB] = 3
CHANNEL_COUNT_MAP[CONF_LIGHT_TYPE_RGBA] = 4
CHANNEL_COUNT_MAP[CONF_LIGHT_TYPE_SWITCH] = 1

# Features supported by light types
FEATURE_MAP[CONF_LIGHT_TYPE_DIMMER] = SUPPORT_BRIGHTNESS
FEATURE_MAP[CONF_LIGHT_TYPE_RGB] = SUPPORT_BRIGHTNESS | SUPPORT_COLOR
FEATURE_MAP[CONF_LIGHT_TYPE_RGBA] = SUPPORT_BRIGHTNESS | SUPPORT_COLOR
FEATURE_MAP[CONF_LIGHT_TYPE_SWITCH] = 0
# endregion


class Universe:
    def __init__(self, hass: HomeAssistant, conx, config: dict):
        print("Init Universe", config)
        self.hass = hass
        self.db: DB = conx.db
        self.name = config["name"]
        self.universe = config["universe"]
        self.subnet = config["subnet"]
        self.ip = config["ip"]
        self.port = config["port"]
        self.level = config["level"]
        self.fps = config["fps"]
        self.keep = config["keep"]
        self.frameTime = 1.0 / self.fps if self.fps > 0 else 1000000
        self.minFrameTime = self.frameTime if self.fps > 0 else 0.04
        self.channelCount = config["channels"]
        self.channels = [self.level] * self.channelCount
        self.duration = 0
        self.update = True
        self.keepTime = 10.0
        self.keepDuration = 0
        self.keepDirty = True
        self.seq = 1

        state = self.db.getData("dmx", self.name)
        if state == None:
            return

        for i in range(0, len(state), 2):
            j = i // 2
            if j < self.channelCount:
                self.channels[j] = int(state[i : i + 2], 16)

    def setChannel(self, ch, val):
        idx = [ch]
        vals = [val]
        if isinstance(ch, list):
            idx = list(range(ch[0], ch[1] + 1, ch[2] if len(ch) >= 3 else 1))
            cnt = len(idx)

            if not isinstance(val, list):
                vals = [val] * cnt
            else:
                vals = [0] * cnt
                st = val[0]
                en = val[1]
                dt = (en - st) / (cnt - 1)
                for i in range(0, cnt):
                    vals[i] = st + i * dt

        cnt = len(idx)
        vals = [int(max(min(round(x * 2.55), 255), 0)) for x in vals]

        for i in range(0, cnt):
            j = idx[i] - 1
            v = vals[i]
            if j < self.channelCount:
                self.channels[j] = v

        self.hass.bus.async_fire(EVENT_UNIVERSE_CHANGE + self.name)
        self.update = True
        self.keepDirty = True

    def getChannels(self, idx):
        cnt = len(idx)
        vals = [0] * cnt
        for i in range(0, cnt):
            j = idx[i] - 1
            if j < self.channelCount:
                vals[i] = self.channels[j]
        return vals

    def setChannels(self, idx, vals):
        cnt = len(idx)

        for i in range(0, cnt):
            j = idx[i] - 1
            v = vals[i]
            if j < self.channelCount:
                self.channels[j] = v

        self.update = True
        self.keepDirty = True

    def should_send(self, elapse: float):
        self.duration += elapse
        if not (
            (self.update and self.duration >= self.minFrameTime)
            or self.duration >= self.frameTime
        ):
            return False

        self.update = False
        self.duration = 0.0
        return True

    def should_keep(self, elapse: float):
        self.keepDuration += elapse
        if not self.keepDirty or self.keepDuration < self.keepTime:
            return False
        self.keepDirty = False
        self.keepDuration = 0
        return True


class DMX:
    def __init__(self, hass: HomeAssistant, conx, config: dict):
        print("Starting DMX server")
        self.hass = hass
        self.db: DB = conx.db
        self.config = config.get("dmx")
        self.universes = {}
        for unv in self.config or []:
            u = Universe(hass, conx, unv)
            self.universes[u.name] = u

        self._socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)  # UDP
        self._socket.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

        packet = bytearray()
        packet.extend(map(ord, "Art-Net"))
        packet.append(0x00)  # Null terminate Art-Net
        packet.extend([0x00, 0x50])  # Opcode ArtDMX 0x5000 (Little endian)
        packet.extend([0x00, 0x0E])  # Protocol version 14
        self._base_packet = packet

    def get_universe(self, name):
        return self.universes[name]

    def set_channel(self, call):
        print("set_channel", call)
        name = call.data.get("name")
        channel = call.data.get("channel")
        value = call.data.get("value")
        if name == None or channel == None or value == None:
            return False

        unv: Universe = self.universes[name]
        if unv == None:
            return False

        unv.setChannel(channel, value)

        return True

    def set_universe(self, call):
        print("set_universe", call)
        name = call.data.get("name")
        universe = call.data.get("universe")
        subnet = call.data.get("subnet")
        fps = call.data.get("fps")
        if name == None:
            return False

        unv: Universe = self.universes[name]
        if unv == None:
            return False

        if universe != None:
            unv.universe = universe
        if subnet != None:
            unv.subnet = subnet
        if fps != None:
            unv.fps = fps
            unv.frameTime = 1.0 / unv.fps if unv.fps > 0 else 1000000

        return True

    def send(self, unv: Universe):
        """Send the current state of DMX values to the gateway via UDP packet."""
        # Copy the base packet then add the channel array
        channels = unv.channels[:]
        packet = self._base_packet[:]
        packet.extend(bytes([unv.seq, unv.universe]))  # Sequence, Physical
        packet.extend([unv.universe, unv.subnet])  # Universe
        packet.extend(pack(">h", unv.channelCount))
        packet.extend(channels)
        self._socket.sendto(packet, (unv.ip, unv.port))

    def keep(self, unv: Universe):
        state = "".join("{:02x}".format(x) for x in unv.channels)
        self.db.setData("dmx", unv.name, state)

    def onStop(self):
        pass

    def onTick(self, elapse: float):
        for u in self.universes:
            unv: Universe = self.universes[u]
            if unv.should_send(elapse):
                self.send(unv)
            if unv.should_keep(elapse):
                self.keep(unv)


def scale_rgb_to_brightness(rgb, brightness):
    brightness_scale = brightness / 255
    scaled_rgb = [
        round(rgb[0] * brightness_scale),
        round(rgb[1] * brightness_scale),
        round(rgb[2] * brightness_scale),
    ]
    return scaled_rgb


class DMXLight(LightEntity):
    def __init__(self, conx, config):
        self._conx = conx
        self._db: DB = conx.db
        self._dmx: DMX = conx.dmx

        # Fixture configuration
        self._dmxName = config.get("dmxName")
        self._unviverse: Universe = self._dmx.get_universe(self._dmxName)
        self._channel = config.get("channel")
        self._name = config.get(CONF_NAME)
        self._type = config.get(CONF_TYPE)

        self._brightness = 0
        self._rgb = [0, 0, 0]

        # Apply maps and calculations
        self._channel_count = CHANNEL_COUNT_MAP.get(self._type, 1)

        self._channels = [
            channel
            for channel in range(self._channel, self._channel + self._channel_count)
        ]
        self._features = FEATURE_MAP.get(self._type)

        self.read_values()

        conx.hass.bus.async_listen(
            EVENT_UNIVERSE_CHANGE + self._dmxName, self.on_universe_change
        )
        # Send default levels to the controller
        # self.update_universe()
        _LOGGER.debug(f"Intialized DMX light {self._name}")
        self.haTS = timer()

    @property
    def name(self):
        return self._name

    @property
    def brightness(self):
        return self._brightness

    @property
    def is_on(self):
        return self.brightness > 0

    @property
    def hs_color(self):
        if self._rgb:
            return color_util.color_RGB_to_hs(*self._rgb)
        else:
            return None

    @property
    def supported_features(self):
        return self._features

    @property
    def should_poll(self):
        return False

    @property
    def state_attributes(self):
        data = {}
        supported_features = self.supported_features

        if supported_features & SUPPORT_BRIGHTNESS:
            data[ATTR_BRIGHTNESS] = self.brightness

        if supported_features & SUPPORT_COLOR and self.hs_color:
            hs_color = self.hs_color
            data[ATTR_HS_COLOR] = (round(hs_color[0], 3), round(hs_color[1], 3))
            data[ATTR_RGB_COLOR] = self._rgb

        return {key: val for key, val in data.items() if val is not None}

    async def async_turn_on(self, **kwargs):
        if len(kwargs) <= 0:
            if self._brightness == 0:
                self._brightness = 255

        # Update state from service call
        if ATTR_BRIGHTNESS in kwargs:
            self._brightness = int(kwargs[ATTR_BRIGHTNESS])

        if ATTR_HS_COLOR in kwargs:
            self._rgb = color_util.color_hs_to_RGB(*kwargs[ATTR_HS_COLOR])

        if ATTR_RGB_COLOR in kwargs:
            fRGB = kwargs[ATTR_RGB_COLOR]
            self._rgb = (int(fRGB[0]), int(fRGB[1]), int(fRGB[2]))

        self.update_universe()

    async def async_turn_off(self, **kwargs):
        if self._brightness > 0:
            self._brightness = 0
        self.update_universe()

    def read_values(self):
        hsv = None
        vals = self._unviverse.getChannels(self._channels)
        if self._type == CONF_LIGHT_TYPE_RGB:
            hsv = color_util.color_RGB_to_hsv(vals[0], vals[1], vals[2])
            self._rgb = vals[0:3]
            self._brightness = round(hsv[2] * 2.55)
        elif self._type == CONF_LIGHT_TYPE_RGBA:
            self._rgb = vals[0:3]
            self._brightness = vals[3]
        else:
            self._brightness = vals[0]

    def dmx_values(self):
        # Select which values to send over DMX
        if False == self.is_on:
            return [0] * len(self._channels)

        if self._type == CONF_LIGHT_TYPE_RGB:
            # Scale the RGB colour value to the selected brightness
            return scale_rgb_to_brightness(self._rgb, self._brightness)
        elif self._type == CONF_LIGHT_TYPE_RGBA:
            # Split the white component out from the scaled RGB values
            return [self._rgb[0], self._rgb[1], self._rgb[2], self._brightness]
        elif self._type == CONF_LIGHT_TYPE_SWITCH:
            if self.is_on:
                return [255]
            else:
                return [0]
        else:
            return [self._brightness]

    def update_universe(self):
        self._unviverse.setChannels(self._channels, self.dmx_values())
        self.writeState()

    def on_universe_change(self, event):
        self.read_values()
        self.writeState()

    def writeState(self):
        ts = timer()
        if ts - self.haTS < 0.125:
            return
        self.haTS = ts
        self.async_write_ha_state()

    def async_update(self):
        pass
