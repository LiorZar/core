import logging

import voluptuous as vol

from homeassistant.core import HomeAssistant
from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.components.sensor import PLATFORM_SCHEMA
from homeassistant.const import (
    CONF_NAME,
    CONF_TYPE,
    STATE_ON,
    STATE_OFF,
    CONF_UNIT_OF_MEASUREMENT,
    CONF_VALUE_TEMPLATE,
)
from homeassistant.helpers import entity_platform
import homeassistant.helpers.config_validation as cv

from .const import DOMAIN, EVENT_AUTOMATA_BOX_CHANGE
from .automata import Automata, AutomataBox

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
        )
    }
)


async def async_setup_platform(hass, config, async_add_entities, discovery_info=None):
    conx = hass.data[DOMAIN]
    automata = config.get("automata")

    conx.db.platforms["sensor"] = entity_platform.current_platform.get()
    sensors = []
    for sensor in automata or []:
        sensors.append(AutomataSensor(conx, sensor))
    async_add_entities(sensors)


class AutomataSensor(BinarySensorEntity):
    def __init__(self, conx, sensor):
        self._conx = conx
        self._db = conx.db
        self._automata: Automata = conx.automata

        self._boxName = sensor.get("boxName")
        self._box: AutomataBox = self._automata.boxes[self._boxName]
        self._channel = sensor.get("channel")
        self._name = sensor.get(CONF_NAME)
        self._on = False

        conx.hass.bus.async_listen(
            EVENT_AUTOMATA_BOX_CHANGE + self._boxName, self.on_box_change
        )

    def on_box_change(self, event):
        if self._channel != event.data["channel"]:
            return
        self._on = event.data["on"]
        self.async_write_ha_state()

    @property
    def name(self):
        return self._name

    @property
    def is_on(self):
        return self._on

    @property
    def state(self):
        return self._on

    @property
    def unit_of_measurement(self):
        return None

    @property
    def device_class(self):
        return None

    @property
    def should_poll(self):
        return False

    def async_update(self):
        pass
