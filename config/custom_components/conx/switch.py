"""Support for switching conx pins on and off."""
import logging
import socket
import voluptuous as vol

from homeassistant.components import recorder
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.components.switch import PLATFORM_SCHEMA, SwitchEntity
from homeassistant.const import CONF_NAME
import homeassistant.helpers.config_validation as cv

from .const import DOMAIN, CONF_IDX

_LOGGER = logging.getLogger(__name__)

PLATFORM_SCHEMA = PLATFORM_SCHEMA.extend(
    {
        vol.Required(CONF_IDX, default=1): cv.positive_int,
        vol.Required(CONF_NAME, default="x"): cv.string,
    }
)


def setup_platform(hass, config, add_entities, discovery_info=None):
    """Set up the Arduino platform."""
    conx = hass.data[DOMAIN]

    switches = []
    switches.append(ConXSwitch(hass, config[CONF_IDX], config[CONF_NAME], conx))
    add_entities(switches)


class ConXSwitch(SwitchEntity, RestoreEntity):
    """Representation of an Arduino switch."""

    def __init__(self, hass, idx, name, conx):
        """Initialize the Pin."""
        self._2dl = conx
        self._idx = idx
        self._name = name
        self._state = None

        self._socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.rsocket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # self.socket.sendto(packet, ("192.168.1.25", 8888))
        self._socket.setblocking(False)
        self.rsocket.setblocking(False)
        self.rsocket.bind(("127.0.0.1", 9998))
        self._socket.sendto(("hi socket").encode(), ("192.168.1.25", 8888))

    async def async_added_to_hass(self):
        """Call when entity about to be added to hass."""
        # If not None, we got an initial value.
        await super().async_added_to_hass()
        if self._state is not None:
            return

        state = await self.async_get_last_state()
        self._state = state and state.state == "on"

    @property
    def should_poll(self) -> bool:
        """Return True if entity has to be polled for state.

        False if entity pushes its state to HA.
        """
        return False

    @property
    def name(self):
        """Get the name of the pin."""
        return self._name

    @property
    def is_on(self):
        """Return true if pin is high/on."""
        return self._state

    async def async_turn_on(self, **kwargs):
        """Turn the pin to high/on."""
        self._state = True
        self.async_write_ha_state()
        self.hass.states.async_set("save.switch_" + self._name, True)

        addr = ("192.168.1.25", 8888)
        packet = bytearray()
        packet.extend(("Hello are rrrr socket").encode())

        try:
            self._socket.sendto(packet, addr)
            # self._2dl.echo.transport.sendto(packet, addr)
        except Exception as e:
            print(e)

        print("send")

    async def async_turn_off(self, **kwargs):
        """Turn the pin to low/off."""
        self._state = False
        self.async_write_ha_state()
        self.hass.states.async_set("save.switch_" + self._name, False)

        # data, addr = self.rsocket.recvfrom(2)
        # print(data)
