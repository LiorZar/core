import logging
import voluptuous as vol

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_platform
from homeassistant.const import CONF_NAME, CONF_TYPE
from homeassistant.components.switch import PLATFORM_SCHEMA
import homeassistant.helpers.config_validation as cv

from .const import DOMAIN
from .automata import AutomataSwitch
from .kincony import KinconySwitch

_LOGGER = logging.getLogger(__name__)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
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
                        vol.Coerce(int), vol.Range(min=1, max=32)
                    ),
                    vol.Required(CONF_NAME): cv.string,
                }
            ],
        ),
    }
)


async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    conx = hass.data[DOMAIN]
    automata = config.get("automata")
    kincony = config.get("kincony")

    conx.db.platforms["switch"] = entity_platform.current_platform.get()
    switches = []
    for cfg in automata or []:
        switches.append(AutomataSwitch(conx, cfg))
    for cfg in kincony or []:
        switches.append(KinconySwitch(conx, cfg))
    async_add_entities(switches)
