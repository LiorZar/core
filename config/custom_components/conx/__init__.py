"""The conx integration."""
import logging

import voluptuous as vol
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .db import DB
from .net import UDP
from .dmx import DMX
import homeassistant.helpers.config_validation as cv

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Schema(
            {
                vol.Optional("dmx"): vol.All(
                    cv.ensure_list,
                    [
                        {
                            vol.Required("name"): cv.string,
                            vol.Optional("ip", default="255.255.255.255"): cv.string,
                            vol.Required("universe"): vol.All(
                                vol.Coerce(int), vol.Range(min=0, max=255)
                            ),
                            vol.Required("subnet", default=0): vol.All(
                                vol.Coerce(int), vol.Range(min=0, max=255)
                            ),
                            vol.Optional("port", default=6454): cv.port,
                            vol.Optional("channels", default=16): vol.All(
                                vol.Coerce(int), vol.Range(min=1, max=512)
                            ),
                            vol.Optional("level", default=0): cv.byte,
                            vol.Optional("fps", default=0): cv.byte,
                            vol.Optional("keep", default=True): cv.boolean,
                        }
                    ],
                )
            }
        )
    },
    extra=vol.ALLOW_EXTRA,
)


async def async_setup(hass: HomeAssistant, config: dict):
    conx = ConX(hass, config)
    hass.data[DOMAIN] = conx

    hass.states.async_set("conx.ConX", "Works!")

    return True


class ConX:
    def __init__(self, hass: HomeAssistant, config: dict):
        self.hass = hass
        self.config = config[DOMAIN]
        self.db = DB(hass, self.config)
        self.udp = UDP(hass, self.db, self.config)
        self.dmx = DMX(hass, self.db, self.config)

        self.hass.services.async_register(DOMAIN, "restore", self.db.restore_state)
        self.hass.services.async_register(DOMAIN, "save", self.db.save_state_srv)
        self.hass.services.async_register(DOMAIN, "channel", self.dmx.set_channel)