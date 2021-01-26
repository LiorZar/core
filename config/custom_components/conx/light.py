import copy
import logging
from typing import Optional
import voluptuous as vol

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_platform
from homeassistant.const import CONF_NAME, CONF_TYPE
from homeassistant.components.light import PLATFORM_SCHEMA
import homeassistant.helpers.config_validation as cv


from .const import DOMAIN, IsIdOrIds
from .dmx import CONF_LIGHT_TYPE_SWITCH
from .dmxLight import DMXLight, CONF_LIGHT_TYPES
from .automata import AutomataLight, Automata4ColorLight
from .kincony import KinconyLight

_LOGGER = logging.getLogger(__name__)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Optional("dmx"): vol.All(
            cv.ensure_list,
            [
                {
                    vol.Required("dmxName"): cv.string,
                    vol.Required("channel"): IsIdOrIds,
                    vol.Required(CONF_NAME): cv.string,
                    vol.Optional(CONF_TYPE, default=CONF_LIGHT_TYPE_SWITCH): vol.In(
                        CONF_LIGHT_TYPES
                    ),
                    vol.Optional("fixture"): cv.string,
                    vol.Optional("fadeOn", default=0): cv.Number,
                    vol.Optional("fadeOff", default=0): cv.Number,
                    vol.Optional("level", default=0): cv.byte,
                    vol.Optional("color"): vol.All(
                        vol.ExactSequence((cv.byte, cv.byte, cv.byte)),
                        vol.Coerce(tuple),
                    ),
                }
            ],
        ),
        vol.Optional("automata"): vol.All(
            cv.ensure_list,
            [
                {
                    vol.Required("boxName"): cv.string,
                    vol.Required("channel"): vol.All(
                        vol.Coerce(int), vol.Range(min=1, max=20)
                    ),
                    vol.Required(CONF_NAME): cv.string,
                    vol.Optional("fixture"): cv.string,
                    vol.Optional("invert", default=False): cv.boolean,
                }
            ],
        ),
        vol.Optional("auto4color"): vol.All(
            cv.ensure_list,
            [
                {
                    vol.Required(CONF_NAME): cv.string,
                    vol.Required("ip"): cv.string,
                    vol.Required("port"): cv.port,
                    vol.Optional("fixture"): cv.string,
                }
            ],
        ),
        vol.Optional("kincony"): vol.All(
            cv.ensure_list,
            [
                {
                    vol.Required("boxName"): cv.string,
                    vol.Required("channel"): vol.All(
                        vol.Coerce(int), vol.Range(min=1, max=32)
                    ),
                    vol.Required(CONF_NAME): cv.string,
                    vol.Optional("fixture"): cv.string,
                }
            ],
        ),
    }
)


async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    conx = hass.data[DOMAIN]
    dmx = config.get("dmx")
    automata = config.get("automata")
    auto4color = config.get("auto4color")
    kincony = config.get("kincony")

    conx.db.platforms["light"] = entity_platform.current_platform.get()
    lights = []
    for cfg in dmx or []:
        try:
            name: str = cfg.get(CONF_NAME)
            fixture: str = cfg.get("fixture")
            if -1 == name.find(";"):
                lights.append(DMXLight(conx, cfg))
            else:
                names = conx.db.ParseSelection(name)
                nums = conx.db.ParseSelection(name, True)
                channel: int = cfg.get("channel")
                for i, name in enumerate(names):
                    c = copy.copy(cfg)
                    c["name"] = name
                    c["channel"] = channel
                    if None != fixture and len(fixture) > 0:
                        c["fixture"] = fixture + nums[i]
                    l = DMXLight(conx, c)
                    lights.append(l)
                    channel += l._channel_count

        except Exception as ex:
            print(cfg, ex)
    for cfg in automata or []:
        try:
            lights.append(AutomataLight(conx, cfg))
        except Exception as ex:
            print(cfg, ex)
    for cfg in auto4color or []:
        try:
            lights.append(Automata4ColorLight(conx, cfg))
        except Exception as ex:
            print(cfg, ex)
    for cfg in kincony or []:
        try:
            lights.append(KinconyLight(conx, cfg))
        except Exception as ex:
            print(cfg, ex)
    async_add_entities(lights)

    return True
