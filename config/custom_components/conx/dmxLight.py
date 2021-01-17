# region defines
import copy
import asyncio
from enum import Enum
from logging import basicConfig
import re
from timeit import default_timer as timer
from typing import Any, Callable, Dict, List, Optional, Tuple

from attr import attributes
from voluptuous.validators import Switch
from homeassistant.const import CONF_NAME, CONF_TYPE, STATE_ON, STATE_OFF
from homeassistant.core import HomeAssistant, State

from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ATTR_HS_COLOR,
    ATTR_RGB_COLOR,
    ATTR_TRANSITION,
    LightEntity,
    PLATFORM_SCHEMA,
    SUPPORT_BRIGHTNESS,
    SUPPORT_COLOR,
)
from homeassistant.util.color import color_hs_to_RGB
import homeassistant.util.color as color_util


from .db import DB
from .ext import EXT
from .dmx import (
    DMX,
    Universe,
    CHANNEL_COUNT_MAP,
    CONF_LIGHT_TYPE_DIMMER,
    CONF_LIGHT_TYPE_RGB,
    CONF_LIGHT_TYPE_RGBA,
    CONF_LIGHT_TYPE_SWITCH,
)
from .tween import FX, Twe
from .fn import Fn, gFN
from .const import DOMAIN, EVENT_UNIVERSE_CHANGE, EPS, clamp, zclamp, mix, Del

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


class Parameter(Enum):
    intensity = 0
    hue = 1
    saturation = 2
    red = 3
    green = 4
    blue = 5


TYPE_PARAMETER_MAP, PARAMETER_MAP = {}, {}
PARAMETER_MAP[ATTR_BRIGHTNESS] = [Parameter.intensity]
PARAMETER_MAP[ATTR_HS_COLOR] = [Parameter.hue, Parameter.saturation]
PARAMETER_MAP[ATTR_RGB_COLOR] = [Parameter.red, Parameter.green, Parameter.blue]
TYPE_PARAMETER_MAP[Parameter.intensity] = SUPPORT_BRIGHTNESS
TYPE_PARAMETER_MAP[Parameter.hue] = SUPPORT_COLOR
TYPE_PARAMETER_MAP[Parameter.saturation] = SUPPORT_COLOR
TYPE_PARAMETER_MAP[Parameter.red] = SUPPORT_COLOR
TYPE_PARAMETER_MAP[Parameter.green] = SUPPORT_COLOR
TYPE_PARAMETER_MAP[Parameter.blue] = SUPPORT_COLOR


def scale_rgb_to_brightness(rgb, brightness):
    brightness_scale = brightness / 255
    scaled_rgb = [
        round(rgb[0] * brightness_scale),
        round(rgb[1] * brightness_scale),
        round(rgb[2] * brightness_scale),
    ]
    return scaled_rgb


# endregion


class Effect(Twe):
    def __init__(
        self, db: DB, parameter: Parameter, sval: float, entity: LightEntity, **data
    ):
        self.parameter = parameter
        self.sval: float = sval
        self.cval: float = sval
        self.onChange: Callable[[Parameter, float], None] = entity.onChange
        self.onFinish: Callable[[Parameter], None] = entity.onFinish
        Twe.__init__(self, **data)

    def setFract(self, f: float, c: float):
        v = self.fx[FX.base] + self.fx[FX.amplitude] * self.fn.value(c)
        self.cval = mix(f, self.sval, v)

    def setState(self):
        self.onChange(self.parameter, self.cval)

    def onEnd(self):
        self.onFinish(self.parameter)


class DMXLight(LightEntity, RestoreEntity):
    def __init__(self, conx, config):
        self._conx = conx
        self._db: DB = conx.db
        self._dmx: DMX = conx.dmx
        self._ext: EXT = conx.ext
        self.parameters: Dict[Parameter, Any] = {Parameter.intensity: 0.0}
        self.effects: Dict[Parameter, Effect] = {}

        self._dmxName = config.get("dmxName")
        self._unviverse: Universe = self._dmx.get_universe(self._dmxName)
        self._name = config.get(CONF_NAME)
        self._type = config.get(CONF_TYPE)
        self._fixture: str = config.get("fixture")
        self._fadeOn = config.get("fadeOn")
        self._fadeOff = config.get("fadeOff")
        ch = config.get("channel")
        if isinstance(ch, int):
            ch = [ch]
        self._patch = ch
        self._patchCount = len(ch)
        self._features = FEATURE_MAP.get(self._type)
        if self._features & SUPPORT_COLOR:
            self.parameters[Parameter.red] = 1.0
            self.parameters[Parameter.green] = 1.0
            self.parameters[Parameter.blue] = 1.0
            self.parameters[Parameter.hue] = 0.0
            self.parameters[Parameter.saturation] = 0.0
        self.values: Dict[Parameter, float] = copy.copy(self.parameters)

        self._channel_count = CHANNEL_COUNT_MAP.get(self._type, 1)

        self._channels = []
        for a in self._patch:
            self._channels += [channel for channel in range(a, a + self._channel_count)]

        conx.hass.bus.async_listen(
            EVENT_UNIVERSE_CHANGE + self._dmxName, self.on_universe_change
        )
        if None != self._fixture:
            self._db.addFixture(self._fixture, self)
        self.haTS = timer()

    async def async_added_to_hass(self):
        await super().async_added_to_hass()

        state = await self.async_get_last_state()
        if None != state and None != state.attributes:
            self.setParameters(self.convertHAToParameters(state.attributes), 0, None)

    @property
    def name(self):
        return self._name

    @property
    def fixture(self):
        return self._fixture

    @property
    def brightness(self):
        return int(self.values[Parameter.intensity] * 255)

    @property
    def is_on(self):
        b = self.parameters[Parameter.intensity]
        if isinstance(b, (int, float)):
            return b > 0.0
        return True

    @property
    def rgb(self):
        return [
            int(self.values[Parameter.red] * 255),
            int(self.values[Parameter.green] * 255),
            int(self.values[Parameter.blue] * 255),
        ]

    @property
    def hs_color(self):
        return color_util.color_RGB_to_hs(*self.rgb)

    @property
    def supported_features(self):
        return self._features

    @property
    def should_poll(self):
        return False

    @property
    def state_attributes(self):
        data = {}
        if self.supported_features & SUPPORT_BRIGHTNESS:
            data[ATTR_BRIGHTNESS] = self.brightness

        if self.supported_features & SUPPORT_COLOR and self.hs_color:
            data[ATTR_HS_COLOR] = self.hs_color
            data[ATTR_RGB_COLOR] = self.rgb

        for p in self.parameters:
            if isinstance(self.parameters[p], dict):
                data[p.name] = self.parameters[p]

        return {key: val for key, val in data.items() if val is not None}

    def convertHAToParameters(self, attributes) -> Dict[Parameter, Any]:
        data: Dict[Parameter, Any] = {}
        if self.supported_features & SUPPORT_BRIGHTNESS:
            brightness = attributes.get(ATTR_BRIGHTNESS)
            if None != brightness:
                data[Parameter.intensity] = zclamp(brightness / 255.0)

        if self.supported_features & SUPPORT_COLOR:
            rgb = None
            hs = attributes.get(ATTR_HS_COLOR)
            if None != hs:
                rgb = color_util.color_hs_to_RGB(*hs)

            rgb = rgb or attributes.get(ATTR_RGB_COLOR)
            if None != rgb:
                data[Parameter.red] = zclamp(rgb[0] / 255.0)
                data[Parameter.green] = zclamp(rgb[1] / 255.0)
                data[Parameter.blue] = zclamp(rgb[2] / 255.0)

        return self.convertToParameters(attributes, data)

    def convertToParameters(
        self, attributes, data: Dict[Parameter, Any] = None
    ) -> Dict[Parameter, Any]:
        data = data or {}
        for att in attributes:
            if att in Parameter.__members__:
                p: Parameter = Parameter[att]
                if None != p:
                    data[p] = attributes[att]

        return data

    def isLegalParam(self, p: Parameter) -> bool:
        return self.supported_features & TYPE_PARAMETER_MAP[p]

    def setParameters(self, data, fade: float, index: float):
        if Parameter.hue in data or Parameter.saturation in data:
            Del(data, Parameter.red)
            Del(data, Parameter.green)
            Del(data, Parameter.blue)
            Del(self.parameters, Parameter.red)
            Del(self.parameters, Parameter.green)
            Del(self.parameters, Parameter.blue)
            Del(self.effects, Parameter.red)
            Del(self.effects, Parameter.green)
            Del(self.effects, Parameter.blue)
        elif Parameter.red in data or Parameter.green in data or Parameter.blue in data:
            Del(self.parameters, Parameter.hue)
            Del(self.parameters, Parameter.saturation)
            Del(self.effects, Parameter.hue)
            Del(self.effects, Parameter.saturation)

        for p in data:
            if False == self.isLegalParam(p):
                continue
            v = copy.deepcopy(data[p])
            self.parameters[p] = v
            if not isinstance(v, dict):
                if fade <= 0:
                    Del(self.effects, p)
                    self.onChange(p, v)
                    continue

                v = {"fn": "one", "size": v}

            if None != index:
                v["index"] = index

            e: Effect = Effect(self._db, p, self.values[p], self, fade=fade, **v)
            self.effects[p] = e
            e.Start()

        if self.effects:
            self._ext.addTick(self)
        else:
            self._ext.remTick(self)

        self.update_universe()

    def onChange(self, p: Parameter, val: float):
        self.values[p] = val
        if Parameter.hue == p or Parameter.saturation == p:
            self.setRGB()
        elif Parameter.red == p or Parameter.green == p or Parameter.blue == p:
            self.setHS()

    def setRGB(self):
        rgb = color_util.color_hs_to_RGB(
            self.values[Parameter.hue] * 360.0,
            self.values[Parameter.saturation] * 100.0,
        )
        self.values[Parameter.red] = zclamp(rgb[0] / 255.0)
        self.values[Parameter.green] = zclamp(rgb[1] / 255.0)
        self.values[Parameter.blue] = zclamp(rgb[2] / 255.0)

    def setHS(self):
        hs = color_util.color_RGB_to_hs(
            self.values[Parameter.red] * 255.0,
            self.values[Parameter.green] * 255.0,
            self.values[Parameter.blue] * 255.0,
        )
        self.values[Parameter.hue] = zclamp(hs[0] / 360.0)
        self.values[Parameter.saturation] = zclamp(hs[1] / 100.0)

    def onFinish(self, parameter: Parameter):
        Del(self.effects, parameter)

        if not self.effects:
            self._ext.remTick(self)

    def onTick(self, elapse: float):
        effects = copy.copy(self.effects)
        for p in effects:
            effects[p].onTick(elapse)

        if effects:
            self.update_universe()

    def light(self, index: float, **kwargs):
        fade = 0
        if ATTR_TRANSITION in kwargs:
            fade = kwargs[ATTR_TRANSITION]
            del kwargs[ATTR_TRANSITION]

        data = self.convertToParameters(kwargs)
        self.setParameters(data, fade, index)

    async def async_turn_on(self, **kwargs):
        fade = 0
        if len(kwargs) <= 0:
            kwargs[ATTR_BRIGHTNESS] = 255
            if self._fadeOn > 0:
                fade = self._fadeOn

        if ATTR_TRANSITION in kwargs:
            fade = kwargs[ATTR_TRANSITION]
            del kwargs[ATTR_TRANSITION]

        data = self.convertHAToParameters(kwargs)
        self.setParameters(data, fade, None)

    async def async_turn_off(self, **kwargs):
        fade = 0
        if len(kwargs) <= 0:
            kwargs[ATTR_BRIGHTNESS] = 0
            if self._fadeOff > 0:
                fade = self._fadeOff

        if ATTR_TRANSITION in kwargs:
            fade = kwargs[ATTR_TRANSITION]
            del kwargs[ATTR_TRANSITION]

        data = self.convertHAToParameters(kwargs)
        self.setParameters(data, fade, None)

    def read_values(self):
        hsv = None
        vals = self._unviverse.getChannels(self._channels)
        if self._type == CONF_LIGHT_TYPE_RGB:
            hsv = color_util.color_RGB_to_hsv(
                max(vals[0], 0.001), max(vals[1], 0.001), max(vals[2], 0.001)
            )
            self._rgb = color_util.color_hs_to_RGB(hsv[0], hsv[1])
            self._brightness = round(hsv[2] * 2.55)
        elif self._type == CONF_LIGHT_TYPE_RGBA:
            hsv = color_util.color_RGB_to_hsv(
                max(vals[0], 0.001), max(vals[1], 0.001), max(vals[2], 0.001)
            )
            self._rgb = color_util.color_hs_to_RGB(hsv[0], hsv[1])
            self._brightness = vals[3]
        else:
            self._brightness = vals[0]
        self._nbrightness = self._brightness

    def dmx_values(self):
        brightness: int = self.brightness
        if brightness <= 0:
            return [0] * len(self._channels)

        if self._type == CONF_LIGHT_TYPE_RGB:
            rgb = self.rgb
            return scale_rgb_to_brightness(rgb, brightness) * self._patchCount
        elif self._type == CONF_LIGHT_TYPE_RGBA:
            rgb = self.rgb
            # Split the white component out from the scaled RGB values
            return [
                rgb[0],
                rgb[1],
                rgb[2],
                brightness,
            ] * self._patchCount
        elif self._type == CONF_LIGHT_TYPE_SWITCH:
            return [255] * self._patchCount
        else:
            return [brightness] * self._patchCount

    def update_universe(self):
        self._unviverse.setChannels(self._channels, self.dmx_values())
        self.writeState()

    def on_universe_change(self, event):
        self.read_values()
        self.writeState()

    def writeState(self, includeTS: bool = True):
        ts = timer()
        if True == includeTS and ts - self.haTS < 0.125:
            self._ext.callLater(
                0.125 - (ts - self.haTS), self.writeState, self, {"includeTS": False}
            )
            return

        self._ext.remove(self.entity_id)
        if True == includeTS:
            self.haTS = ts
        self.async_write_ha_state()

    def async_update(self):
        pass
