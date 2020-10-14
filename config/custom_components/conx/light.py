import logging

from homeassistant.const import CONF_NAME, CONF_TYPE, STATE_ON, STATE_OFF
from homeassistant.core import HomeAssistant
from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ATTR_COLOR_TEMP,
    ATTR_HS_COLOR,
    ATTR_RGB_COLOR,
    ATTR_XY_COLOR,
    LightEntity,
    PLATFORM_SCHEMA,
    SUPPORT_BRIGHTNESS,
    SUPPORT_COLOR,
    SUPPORT_COLOR_TEMP,
)
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
CHANNEL_COUNT_MAP, FEATURE_MAP, COLOR_MAP = {}, {}, {}
CHANNEL_COUNT_MAP[CONF_LIGHT_TYPE_DIMMER] = 1
CHANNEL_COUNT_MAP[CONF_LIGHT_TYPE_RGB] = 3
CHANNEL_COUNT_MAP[CONF_LIGHT_TYPE_RGBA] = 4
CHANNEL_COUNT_MAP[CONF_LIGHT_TYPE_SWITCH] = 1

# Features supported by light types
FEATURE_MAP[CONF_LIGHT_TYPE_DIMMER] = SUPPORT_BRIGHTNESS
FEATURE_MAP[CONF_LIGHT_TYPE_RGB] = SUPPORT_BRIGHTNESS | SUPPORT_COLOR
FEATURE_MAP[CONF_LIGHT_TYPE_RGBA] = SUPPORT_BRIGHTNESS | SUPPORT_COLOR
FEATURE_MAP[CONF_LIGHT_TYPE_SWITCH] = 0

# Default color for each light type if not specified in configuration
COLOR_MAP[CONF_LIGHT_TYPE_DIMMER] = None
COLOR_MAP[CONF_LIGHT_TYPE_RGB] = [255, 255, 255]
COLOR_MAP[CONF_LIGHT_TYPE_RGBA] = [255, 255, 255]
COLOR_MAP[CONF_LIGHT_TYPE_SWITCH] = None

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
        self._dmx: DMX = conx.dmx

        # Fixture configuration
        self._dmxName = light.get("dmxName")
        self._unviverse: Universe = self._dmx.get_universe(self._dmxName)
        self._channel = light.get("channel")
        self._name = light.get(CONF_NAME)

        self._type = light.get(CONF_TYPE)

        self._brightness = light.get("level")
        self._rgb = light.get("color", COLOR_MAP.get(self._type))
        self._color_temp = int((self.min_mireds + self.max_mireds) / 2)

        # Apply maps and calculations
        self._channel_count = CHANNEL_COUNT_MAP.get(self._type, 1)

        self._channels = [
            channel
            for channel in range(self._channel, self._channel + self._channel_count)
        ]
        self._features = FEATURE_MAP.get(self._type)

        # Brightness needs to be set to the maximum default RGB level, then
        # scale up the RGB values to what HA uses
        if self._rgb:
            self._brightness = max(self._rgb) * (self._brightness / 255)

        self.read_values()

        conx.hass.bus.async_listen(
            EVENT_UNIVERSE_CHANGE + self._dmxName, self.on_universe_change
        )
        # Send default levels to the controller
        # self.update_universe()
        _LOGGER.debug(f"Intialized DMX light {self._name}")

    @property
    def name(self):
        return self._name

    @property
    def brightness(self):
        return self._brightness

    @property
    def is_on(self):
        return self._state == STATE_ON

    @property
    def hs_color(self):
        if self._rgb:
            return color_util.color_RGB_to_hs(*self._rgb)
        else:
            return None

    @property
    def color_temp(self):
        return self._color_temp

    @property
    def supported_features(self):
        return self._features

    @property
    def should_poll(self):
        return False

    @property
    def state_attributes(self):
        if not self.is_on:
            return None

        data = {}
        supported_features = self.supported_features

        if supported_features & SUPPORT_BRIGHTNESS:
            data[ATTR_BRIGHTNESS] = self.brightness

        if supported_features & SUPPORT_COLOR_TEMP:
            data[ATTR_COLOR_TEMP] = self.color_temp

        if supported_features & SUPPORT_COLOR and self.hs_color:
            hs_color = self.hs_color
            data[ATTR_HS_COLOR] = (round(hs_color[0], 3), round(hs_color[1], 3))
            data[ATTR_RGB_COLOR] = self._rgb
            data[ATTR_XY_COLOR] = color_util.color_hs_to_xy(*hs_color)

        return {key: val for key, val in data.items() if val is not None}

    async def async_turn_on(self, **kwargs):
        self._state = STATE_ON

        # Update state from service call
        if ATTR_BRIGHTNESS in kwargs:
            self._brightness = kwargs[ATTR_BRIGHTNESS]

        if self._brightness == 0:
            self._brightness = 255

        if ATTR_HS_COLOR in kwargs:
            self._rgb = color_util.color_hs_to_RGB(*kwargs[ATTR_HS_COLOR])

        if ATTR_COLOR_TEMP in kwargs:
            self._color_temp = kwargs[ATTR_COLOR_TEMP]

        self.update_universe()

    async def async_turn_off(self, **kwargs):
        self._state = STATE_OFF
        if self._brightness > 0:
            self._brightness = 0
        self.update_universe()

    def read_values(self):
        hsv = None
        vals = self._unviverse.getChannels(self._channels)
        if self._type == CONF_LIGHT_TYPE_RGB:
            hsv = color_util.color_RGB_to_hsv(
                vals[0] / 255, vals[1] / 255, vals[2] / 255
            )
            self._rgb = color_util.color_hsv_to_RGB(hsv[0], hsv[1], 100)
            self._brightness = round(hsv[2] * 2.55)
        elif self._type == CONF_LIGHT_TYPE_RGBA:
            self._rgb = vals[0:3]
            self._brightness = vals[3]
        else:
            self._brightness = vals[0]

        if self._brightness > 0:
            self._state = STATE_ON
        else:
            self._state = STATE_OFF

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
        self.async_write_ha_state()

    def on_universe_change(self, event):
        self.read_values()
        self.async_write_ha_state()

    def update(self):
        """Fetch update state."""
        print("update", self._name)
