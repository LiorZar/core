"""The conx integration."""
import time
import logging
import threading
import voluptuous as vol
from homeassistant.core import HomeAssistant
from homeassistant.const import EVENT_HOMEASSISTANT_STOP
from homeassistant.components import websocket_api

from .const import DOMAIN
from .db import DB
from .net import UDP
from .dmx import DMX
from .fde import FDE
from .edt import EDT
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

WEBSOCKET_COMMAND = ["conx/POST", "conx/GET"]
SCHEMA_WEBSOCKET = websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
    {
        "type": vol.In(WEBSOCKET_COMMAND),
        vol.Optional("entity_id"): cv.entity_id,
        vol.Optional("entity_ids"): cv.entity_ids,
        vol.Optional("value"): cv.string,
    }
)


async def async_setup(hass: HomeAssistant, config: dict):
    conx = ConX(hass, config)
    hass.data[DOMAIN] = conx

    hass.states.async_set("conx.ConX", "Works!")
    #        self.hass.bus.listen_once(EVENT_HOMEASSISTANT_STOP, self.onStop)

    def on_hass_stop(event):
        conx.onStop()

    hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, on_hass_stop)

    return True


class ConX(threading.Thread):
    def __init__(self, hass: HomeAssistant, config: dict):
        threading.Thread.__init__(self)
        self.lock = threading.Lock()
        self.hass = hass
        self.config = config[DOMAIN]
        self.db = DB(hass, self.config)
        self.udp = UDP(hass, self.db, self.config)
        self.dmx = DMX(hass, self.db, self.config)
        self.fde = FDE(hass, self.db, self.config)
        # self.edt = EDT(hass, self.db, self.config)

        self.hass.services.async_register(DOMAIN, "restore", self.db.restore_state)
        self.hass.services.async_register(DOMAIN, "save", self.db.save_state_srv)
        self.hass.services.async_register(DOMAIN, "channel", self.dmx.set_channel)
        self.hass.services.async_register(DOMAIN, "universe", self.dmx.set_universe)
        self.hass.services.async_register(DOMAIN, "fade", self.fde.fade)

        for cmd in WEBSOCKET_COMMAND:
            self.hass.components.websocket_api.async_register_command(
                cmd, self.websocket_handle, SCHEMA_WEBSOCKET
            )

        self.active = True
        self.start()

    def onStop(self):
        self.active = False
        self.join()

        self.db.onStop()
        self.udp.onStop()
        self.dmx.onStop()
        self.fde.onStop()
        # self.edt.onStop()

    def websocket_handle(self, hass: HomeAssistant, connection, msg):
        print(msg)
        connection.send_message(websocket_api.result_message(msg["id"], msg))

    def onTick(self, elapse: float):
        self.db.onTick(elapse)
        self.udp.onTick(elapse)
        self.dmx.onTick(elapse)
        self.fde.onTick(elapse)
        # self.edt.onTick(elapse)

    def run(self):
        _LOGGER.debug("Conx thread started")
        ts = time.perf_counter()
        es = time.perf_counter()
        while self.active:
            es = ts
            ts = time.perf_counter()
            es = ts - es
            self.onTick(es)
            time.sleep(0.02)

        _LOGGER.debug("Conx thread stopped")