"""Support for switching conx pins on and off."""
import logging
import socket
import voluptuous as vol

from homeassistant.components import recorder
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.components.switch import PLATFORM_SCHEMA, SwitchEntity
from homeassistant.const import CONF_NAME, CONF_TYPE, STATE_ON, STATE_OFF
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

    conx.db.platforms["switch"] = entity_platform.current_platform.get()
    switches = []
    for sw in automata:
        switches.append(AutomataSwitch(conx, sw))
    async_add_entities(switches)


class AutomataSwitch(SwitchEntity, RestoreEntity):
    def __init__(self, conx, sw):
        self._conx = conx
        self._db = conx.db
        self._automata: Automata = conx.automata

        self._boxName = sw.get("boxName")
        self._box: AutomataBox = self._automata.boxes[self._boxName]
        self._channel = sw.get("channel")
        self._name = sw.get(CONF_NAME)
        self._on = None

        conx.hass.bus.async_listen(
            EVENT_AUTOMATA_BOX_CHANGE + self._boxName, self.on_box_change
        )

    def on_box_change(self, event):
        if self._channel != event.data["channel"]:
            return
        self._on = event.data["on"]
        self.async_schedule_update_ha_state()

    async def async_added_to_hass(self):
        await super().async_added_to_hass()
        if self._on is not None:
            return

        state = await self.async_get_last_state()
        self._on = state and state.state == STATE_ON

    @property
    def should_poll(self) -> bool:
        return False

    @property
    def name(self):
        return self._name

    @property
    def is_on(self):
        return self._on

    async def async_turn_on(self, **kwargs):
        self._on = True
        self._box.SendON(self._channel)
        self.async_schedule_update_ha_state()

    async def async_turn_off(self, **kwargs):
        self._on = False
        self._box.SendOFF(self._channel)
        self.async_schedule_update_ha_state()

    def async_update(self):
        pass
