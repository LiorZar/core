import logging

import voluptuous as vol

from homeassistant.core import HomeAssistant
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import CONF_NAME, CONF_TYPE
from homeassistant.helpers import entity_platform
import homeassistant.helpers.config_validation as cv

from .const import DOMAIN
from .automata import AutomataSensor, AutomataWGSensor
from .net import UDPSensor

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
                    vol.Optional("match"): cv.string,
                    vol.Optional("invert", default=False): cv.boolean,
                }
            ],
        ),
        vol.Optional("automata_wglan"): vol.All(
            cv.ensure_list,
            [
                {
                    vol.Required(CONF_NAME): cv.string,
                    vol.Required("ip"): cv.string,
                    vol.Required("port"): cv.port,
                }
            ],
        ),
        vol.Optional("udp"): vol.All(
            cv.ensure_list,
            [
                {
                    vol.Required(CONF_NAME): cv.string,
                    vol.Required("ip"): cv.string,
                    vol.Required("port"): cv.port,
                    vol.Optional("echo", default=False): cv.boolean,
                }
            ],
        ),
    }
)


async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    conx = hass.data[DOMAIN]
    automata = config.get("automata")
    automata_wglan = config.get("automata_wglan")
    udp = config.get("udp")

    conx.db.platforms["sensor"] = entity_platform.current_platform.get()
    sensors = []
    for cfg in automata or []:
        try:
            sensors.append(AutomataSensor(conx, cfg))
        except Exception as ex:
            print(cfg, ex)
    for cfg in automata_wglan or []:
        try:
            sensors.append(AutomataWGSensor(conx, cfg))
        except Exception as ex:
            print(cfg, ex)
    for cfg in udp or []:
        try:
            sensors.append(UDPSensor(conx, cfg))
        except Exception as ex:
            print(cfg, ex)
    async_add_entities(sensors)
