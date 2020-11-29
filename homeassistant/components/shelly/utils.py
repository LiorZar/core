"""Shelly helpers functions."""

<<<<<<< HEAD
<<<<<<< HEAD
from datetime import datetime, timedelta
=======
from datetime import timedelta
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
from datetime import timedelta
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
import logging
from typing import Optional

import aioshelly

<<<<<<< HEAD
<<<<<<< HEAD
from homeassistant.components.sensor import DEVICE_CLASS_TIMESTAMP
from homeassistant.const import TEMP_CELSIUS, TEMP_FAHRENHEIT
from homeassistant.helpers import entity_registry

from . import ShellyDeviceWrapper
=======
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
from homeassistant.const import TEMP_CELSIUS, TEMP_FAHRENHEIT
from homeassistant.util.dt import parse_datetime, utcnow

from .const import DOMAIN
<<<<<<< HEAD
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f

_LOGGER = logging.getLogger(__name__)


<<<<<<< HEAD
<<<<<<< HEAD
async def async_remove_entity_by_domain(hass, domain, unique_id, config_entry_id):
    """Remove entity by domain."""

    entity_reg = await hass.helpers.entity_registry.async_get_registry()
    for entry in entity_registry.async_entries_for_config_entry(
        entity_reg, config_entry_id
    ):
        if entry.domain == domain and entry.unique_id == unique_id:
            entity_reg.async_remove(entry.entity_id)
            _LOGGER.debug("Removed %s domain for %s", domain, entry.original_name)
            break
=======
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
async def async_remove_shelly_entity(hass, domain, unique_id):
    """Remove a Shelly entity."""
    entity_reg = await hass.helpers.entity_registry.async_get_registry()
    entity_id = entity_reg.async_get_entity_id(domain, DOMAIN, unique_id)
    if entity_id:
        _LOGGER.debug("Removing entity: %s", entity_id)
        entity_reg.async_remove(entity_id)
<<<<<<< HEAD
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f


def temperature_unit(block_info: dict) -> str:
    """Detect temperature unit."""
    if block_info[aioshelly.BLOCK_VALUE_UNIT] == "F":
        return TEMP_FAHRENHEIT
    return TEMP_CELSIUS


<<<<<<< HEAD
<<<<<<< HEAD
def get_entity_name(
    wrapper: ShellyDeviceWrapper,
    block: aioshelly.Block,
    description: Optional[str] = None,
):
    """Naming for switch and sensors."""
    entity_name = wrapper.name
=======
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
def get_device_name(device: aioshelly.Device) -> str:
    """Naming for device."""
    return device.settings["name"] or device.settings["device"]["hostname"]


def get_entity_name(
    device: aioshelly.Device,
    block: aioshelly.Block,
    description: Optional[str] = None,
) -> str:
    """Naming for switch and sensors."""
    entity_name = get_device_name(device)
<<<<<<< HEAD
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f

    if block:
        channels = None
        if block.type == "input":
<<<<<<< HEAD
<<<<<<< HEAD
            channels = wrapper.device.shelly.get("num_inputs")
        elif block.type == "emeter":
            channels = wrapper.device.shelly.get("num_emeters")
        elif block.type in ["relay", "light"]:
            channels = wrapper.device.shelly.get("num_outputs")
=======
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
            # Shelly Dimmer/1L has two input channels and missing "num_inputs"
            if device.settings["device"]["type"] in ["SHDM-1", "SHDM-2", "SHSW-L"]:
                channels = 2
            else:
                channels = device.shelly.get("num_inputs")
        elif block.type == "emeter":
            channels = device.shelly.get("num_emeters")
        elif block.type in ["relay", "light"]:
            channels = device.shelly.get("num_outputs")
<<<<<<< HEAD
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
        elif block.type in ["roller", "device"]:
            channels = 1

        channels = channels or 1

        if channels > 1 and block.type != "device":
            entity_name = None
            mode = block.type + "s"
<<<<<<< HEAD
<<<<<<< HEAD
            if mode in wrapper.device.settings:
                entity_name = wrapper.device.settings[mode][int(block.channel)].get(
                    "name"
                )

            if not entity_name:
                if wrapper.model == "SHEM-3":
                    base = ord("A")
                else:
                    base = ord("1")
                entity_name = f"{wrapper.name} channel {chr(int(block.channel)+base)}"

        # Shelly Dimmer has two input channels and missing "num_inputs"
        if wrapper.model in ["SHDM-1", "SHDM-2"] and block.type == "input":
            entity_name = f"{entity_name} channel {int(block.channel)+1}"
=======
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
            if mode in device.settings:
                entity_name = device.settings[mode][int(block.channel)].get("name")

            if not entity_name:
                if device.settings["device"]["type"] == "SHEM-3":
                    base = ord("A")
                else:
                    base = ord("1")
                entity_name = (
                    f"{get_device_name(device)} channel {chr(int(block.channel)+base)}"
                )
<<<<<<< HEAD
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f

    if description:
        entity_name = f"{entity_name} {description}"

    return entity_name


<<<<<<< HEAD
<<<<<<< HEAD
def get_rest_value_from_path(status, device_class, path: str):
    """Parser for REST path from device status."""

    if "/" not in path:
        _attribute_value = status[path]
    else:
        _attribute_value = status[path.split("/")[0]][path.split("/")[1]]
    if device_class == DEVICE_CLASS_TIMESTAMP:
        last_boot = datetime.utcnow() - timedelta(seconds=_attribute_value)
        _attribute_value = last_boot.replace(microsecond=0).isoformat()

    if "new_version" in path:
        _attribute_value = _attribute_value.split("/")[1].split("@")[0]

    return _attribute_value
=======
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
def is_momentary_input(settings: dict, block: aioshelly.Block) -> bool:
    """Return true if input button settings is set to a momentary type."""
    button = settings.get("relays") or settings.get("lights") or settings.get("inputs")

    # Shelly 1L has two button settings in the first channel
    if settings["device"]["type"] == "SHSW-L":
        channel = int(block.channel or 0) + 1
        button_type = button[0].get("btn" + str(channel) + "_type")
    else:
        # Some devices has only one channel in settings
        channel = min(int(block.channel or 0), len(button) - 1)
        button_type = button[channel].get("btn_type")

    return button_type in ["momentary", "momentary_on_release"]


def get_device_uptime(status: dict, last_uptime: str) -> str:
    """Return device uptime string, tolerate up to 5 seconds deviation."""
    uptime = utcnow() - timedelta(seconds=status["uptime"])

    if not last_uptime:
        return uptime.replace(microsecond=0).isoformat()

    if abs((uptime - parse_datetime(last_uptime)).total_seconds()) > 5:
        return uptime.replace(microsecond=0).isoformat()

    return last_uptime
<<<<<<< HEAD
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
