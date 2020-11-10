import logging
from timeit import default_timer as timer
from homeassistant.const import CONF_NAME, CONF_TYPE, STATE_ON, STATE_OFF
from homeassistant.core import HomeAssistant
from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ATTR_HS_COLOR,
    ATTR_RGB_COLOR,
    LightEntity,
    PLATFORM_SCHEMA,
    SUPPORT_BRIGHTNESS,
    SUPPORT_COLOR,
)
from homeassistant.helpers import entity_platform
from homeassistant.util.color import color_rgb_to_rgbw
import homeassistant.helpers.config_validation as cv
import homeassistant.util.color as color_util
import voluptuous as vol

from .const import DOMAIN, EVENT_UNIVERSE_CHANGE
from .dmx import DMX, Universe

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

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Optional("dmx"): vol.All(
            cv.ensure_list,
            [
                {
                    vol.Required("dmxName"): cv.string,
                    vol.Required("channel"): vol.All(
                        vol.Coerce(int), vol.Range(min=1, max=512)
                    ),
                    vol.Required(CONF_NAME): cv.string,
                    vol.Optional(CONF_TYPE, default=CONF_LIGHT_TYPE_SWITCH): vol.In(
                        CONF_LIGHT_TYPES
                    ),
                    vol.Optional("level", default=0): cv.byte,
                    vol.Optional("color"): vol.All(
                        vol.ExactSequence((cv.byte, cv.byte, cv.byte)),
                        vol.Coerce(tuple),
                    ),
                }
            ],
        )
    }
)


async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    conx = hass.data[DOMAIN]
    dmx = config.get("dmx")

    conx.db.platforms["light"] = entity_platform.current_platform.get()
    lights = []
    for light in dmx:
        lights.append(DMXLight(conx, light))
    async_add_entities(lights)

    return True


def scale_rgb_to_brightness(rgb, brightness):
    brightness_scale = brightness / 255
    scaled_rgb = [
        round(rgb[0] * brightness_scale),
        round(rgb[1] * brightness_scale),
        round(rgb[2] * brightness_scale),
    ]
    return scaled_rgb


class DMXLight(LightEntity):
    def __init__(self, conx, light):
        self._conx = conx
        self._db = conx.db
        self._dmx: DMX = conx.dmx

        # Fixture configuration
        self._dmxName = light.get("dmxName")
        self._unviverse: Universe = self._dmx.get_universe(self._dmxName)
        self._channel = light.get("channel")
        self._name = light.get(CONF_NAME)
        self._type = light.get(CONF_TYPE)

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
            self._brightness = round(kwargs[ATTR_BRIGHTNESS])

        if ATTR_HS_COLOR in kwargs:
            self._rgb = color_util.color_hs_to_RGB(*kwargs[ATTR_HS_COLOR])

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
        self.async_schedule_update_ha_state()

    def async_update(self):
        """Fetch update state."""
