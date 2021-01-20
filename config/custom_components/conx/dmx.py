# region imports
import yaml
import math
import socket
from struct import pack
from homeassistant.core import HomeAssistant
from homeassistant.util.yaml import load_yaml, save_yaml
from typing import Any, Dict

from .db import DB
from .const import DOMAIN, EVENT_UNIVERSE_CHANGE, fract

CONF_LIGHT_TYPE_DIMMER = "dimmer"
CONF_LIGHT_TYPE_RGB = "rgb"
CONF_LIGHT_TYPE_RGBA = "rgba"
CONF_LIGHT_TYPE_SWITCH = "switch"
# Number of channels used by each light type
CHANNEL_COUNT_MAP = {}
CHANNEL_COUNT_MAP[CONF_LIGHT_TYPE_DIMMER] = 1
CHANNEL_COUNT_MAP[CONF_LIGHT_TYPE_RGB] = 3
CHANNEL_COUNT_MAP[CONF_LIGHT_TYPE_RGBA] = 4
CHANNEL_COUNT_MAP[CONF_LIGHT_TYPE_SWITCH] = 1

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

    def getVal(self, i: int, cnt: int, vnt: int, vals: list) -> int:
        f: float = float(i) / float(cnt - 1)  # [0,1]
        fi: float = f * vnt  # [0,vnt)
        j: int = math.floor(fi)  # [0,vnt-1]
        if j >= vnt:
            return vals[j]

        f = fract(f)
        f = vals[j] * (1.0 - f) + vals[j + 1] * f
        return int(max(min(round(f), 255), 0))

    def setChannel(self, ch: str, val):
        idx = self.db.ParseSelection(ch)
        idx = [int(x) for x in idx]

        vals = [val]
        if isinstance(val, str):
            vals = self.db.ParseSelection(val)
            vals = [int(x) for x in vals]

        cnt = len(idx)
        vnt = len(vals) - 1
        vals = [int(max(min(round(x * 2.55), 255), 0)) for x in vals]

        for i in range(0, cnt):
            j = idx[i] - 1
            v = self.getVal(i, cnt, vnt, vals)
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

    def patch(self, call):
        print("patch", call)
        dmxName = call.data.get("dmxName")
        name = call.data.get("name")
        channel = call.data.get("channel")
        start = call.data.get("start")
        type = call.data.get("type")
        count = call.data.get("count")
        if (
            None == dmxName
            or None == name
            or None == channel
            or None == type
            or None == count
        ):
            return False

        channel_count: int = CHANNEL_COUNT_MAP.get(type, 1)
        data = None
        dmx = None
        try:
            data = load_yaml(self.hass.config.path("lights/conx.yaml"))
            dmx = data[0]["dmx"]
        except Exception as e:
            print(e)
            return False

        for i in range(count):
            dmx.append(
                {
                    "dmxName": dmxName,
                    "name": name + str(start + i),
                    "channel": channel + i * channel_count,
                    "type": type,
                }
            )

        res = yaml.safe_dump(
            data,
            default_flow_style=False,
            indent=2,
            allow_unicode=True,
            sort_keys=False,
        )
        res = "\n\n  -".join(res.split("\n  -"))
        res = res.replace(": null\n", ":\n")

        with open(
            self.hass.config.path("lights/conx.yaml"), "w", encoding="utf-8"
        ) as outfile:
            outfile.write(res)

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
        # state = "".join("{:02x}".format(x) for x in unv.channels)
        # self.db.setData("dmx", unv.name, state)
        pass

    def onStop(self):
        pass

    def onTick(self, elapse: float):
        for u in self.universes:
            unv: Universe = self.universes[u]
            if unv.should_send(elapse):
                self.send(unv)
            if unv.should_keep(elapse):
                self.keep(unv)
