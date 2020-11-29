"""Plugwise platform for Home Assistant Core."""
<<<<<<< HEAD
<<<<<<< HEAD
import asyncio

import voluptuous as vol
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_HOST
from homeassistant.core import HomeAssistant

<<<<<<< HEAD
<<<<<<< HEAD
from .const import ALL_PLATFORMS, DOMAIN, UNDO_UPDATE_LISTENER
from .gateway import async_setup_entry_gw

CONFIG_SCHEMA = vol.Schema({DOMAIN: vol.Schema({})}, extra=vol.ALLOW_EXTRA)
=======
from .gateway import async_setup_entry_gw, async_unload_entry_gw
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
from .gateway import async_setup_entry_gw, async_unload_entry_gw
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f


async def async_setup(hass: HomeAssistant, config: dict):
    """Set up the Plugwise platform."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Plugwise components from a config entry."""
    if entry.data.get(CONF_HOST):
        return await async_setup_entry_gw(hass, entry)
    # PLACEHOLDER USB entry setup
    return False


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Unload the Plugwise components."""
    if entry.data.get(CONF_HOST):
        return await async_unload_entry_gw(hass, entry)
    # PLACEHOLDER USB entry setup
    return False
