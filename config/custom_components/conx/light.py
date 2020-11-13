import logging
import voluptuous as vol

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_platform
from homeassistant.const import CONF_NAME, CONF_TYPE
from homeassistant.components.light import PLATFORM_SCHEMA
import homeassistant.helpers.config_validation as cv


from .const import DOMAIN
from .dmx import DMXLight, CONF_LIGHT_TYPE_SWITCH, CONF_LIGHT_TYPES
from .automata import AutomataLight
from .kincony import KinconyLight

_LOGGER = logging.getLogger(__name__)

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
                }
            ],
        ),
        vol.Optional("kincony"): vol.All(
            cv.ensure_list,
            [
                {
                    vol.Required("boxName"): cv.string,
                    vol.Required("channel"): vol.All(
                        vol.Coerce(int), vol.Range(min=1, max=20)
                    ),
                    vol.Required(CONF_NAME): cv.string,
                }
            ],
        ),
    }
)


async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    conx = hass.data[DOMAIN]
    dmx = config.get("dmx")
    automata = config.get("automata")
    kincony = config.get("kincony")

    conx.db.platforms["light"] = entity_platform.current_platform.get()
    lights = []
    for light in dmx or []:
        lights.append(DMXLight(conx, light))
    for light in automata or []:
        lights.append(AutomataLight(conx, light))
    for light in kincony or []:
        lights.append(KinconyLight(conx, light))
    async_add_entities(lights)

    return True
