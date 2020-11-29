"""Support for Google Nest SDM sensors."""

<<<<<<< HEAD
=======
import logging
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
from typing import Optional

from google_nest_sdm.device import Device
from google_nest_sdm.device_traits import HumidityTrait, TemperatureTrait
<<<<<<< HEAD
=======
from google_nest_sdm.exceptions import GoogleNestException
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    DEVICE_CLASS_HUMIDITY,
    DEVICE_CLASS_TEMPERATURE,
    PERCENTAGE,
    TEMP_CELSIUS,
)
<<<<<<< HEAD
=======
from homeassistant.exceptions import PlatformNotReady
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.typing import HomeAssistantType

from .const import DOMAIN, SIGNAL_NEST_UPDATE
from .device_info import DeviceInfo

<<<<<<< HEAD
=======
_LOGGER = logging.getLogger(__name__)


>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
DEVICE_TYPE_MAP = {
    "sdm.devices.types.CAMERA": "Camera",
    "sdm.devices.types.DISPLAY": "Display",
    "sdm.devices.types.DOORBELL": "Doorbell",
    "sdm.devices.types.THERMOSTAT": "Thermostat",
}


async def async_setup_sdm_entry(
    hass: HomeAssistantType, entry: ConfigEntry, async_add_entities
) -> None:
    """Set up the sensors."""

    subscriber = hass.data[DOMAIN][entry.entry_id]
<<<<<<< HEAD
    device_manager = await subscriber.async_get_device_manager()

    # Fetch initial data so we have data when entities subscribe.
=======
    try:
        device_manager = await subscriber.async_get_device_manager()
    except GoogleNestException as err:
        _LOGGER.warning("Failed to get devices: %s", err)
        raise PlatformNotReady from err
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f

    entities = []
    for device in device_manager.devices.values():
        if TemperatureTrait.NAME in device.traits:
            entities.append(TemperatureSensor(device))
        if HumidityTrait.NAME in device.traits:
            entities.append(HumiditySensor(device))
    async_add_entities(entities)


class SensorBase(Entity):
    """Representation of a dynamically updated Sensor."""

    def __init__(self, device: Device):
        """Initialize the sensor."""
        self._device = device
        self._device_info = DeviceInfo(device)

    @property
    def should_poll(self) -> bool:
        """Disable polling since entities have state pushed via pubsub."""
        return False

    @property
    def unique_id(self) -> Optional[str]:
        """Return a unique ID."""
        # The API "name" field is a unique device identifier.
        return f"{self._device.name}-{self.device_class}"

    @property
    def device_info(self):
        """Return device specific attributes."""
        return self._device_info.device_info

    async def async_added_to_hass(self):
        """Run when entity is added to register update signal handler."""
        # Event messages trigger the SIGNAL_NEST_UPDATE, which is intercepted
        # here to re-fresh the signals from _device.  Unregister this callback
        # when the entity is removed.
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass,
                SIGNAL_NEST_UPDATE,
                self.async_write_ha_state,
            )
        )


class TemperatureSensor(SensorBase):
    """Representation of a Temperature Sensor."""

    @property
    def name(self):
        """Return the name of the sensor."""
        return f"{self._device_info.device_name} Temperature"

    @property
    def state(self):
        """Return the state of the sensor."""
        trait = self._device.traits[TemperatureTrait.NAME]
        return trait.ambient_temperature_celsius

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement."""
        return TEMP_CELSIUS

    @property
    def device_class(self):
        """Return the class of this device."""
        return DEVICE_CLASS_TEMPERATURE


class HumiditySensor(SensorBase):
    """Representation of a Humidity Sensor."""

    @property
    def unique_id(self) -> Optional[str]:
        """Return a unique ID."""
        # The API returns the identifier under the name field.
        return f"{self._device.name}-humidity"

    @property
    def name(self):
        """Return the name of the sensor."""
        return f"{self._device_info.device_name} Humidity"

    @property
    def state(self):
        """Return the state of the sensor."""
        trait = self._device.traits[HumidityTrait.NAME]
        return trait.ambient_humidity_percent

    @property
    def unit_of_measurement(self):
        """Return the unit of measurement."""
        return PERCENTAGE

    @property
    def device_class(self):
        """Return the class of this device."""
        return DEVICE_CLASS_HUMIDITY
