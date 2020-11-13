import logging
import threading
from typing import Any, Dict

from .const import DOMAIN, EVENT_AUTOMATA_BOX_CHANGE
from .db import DB
from .net import TCP
from homeassistant.core import HomeAssistant
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.components.switch import SwitchEntity
from homeassistant.components.light import LightEntity
from homeassistant.const import CONF_NAME, CONF_TYPE, STATE_ON, STATE_OFF


_LOGGER = logging.getLogger(__name__)


class AutomataBox:
    def __init__(self, hass: HomeAssistant, db: DB, tcp: TCP, config: dict, lock):
        print("Init AutomataBox", config)
        self.hass = hass
        self.db = db
        self.tcp = tcp
        self.lock = lock
        self.name = config["name"]
        self.ip = config["ip"]
        self.port = config["port"]
        self.type = config["type"]

        # self.tcp.Connect(self.name, self.ip, self.port, self.onNet)
        # self.Send(b"[STATUS]")

    def onNet(self, cmd: str, data: bytearray):
        print(self.name, cmd, data)
        if None == data:
            return
        msg: str = data.decode("utf-8")
        if "[" != msg[0] or msg[-1] != "]":
            print("bad automata message")
            return

        msg = msg[1:-1]
        if "STATUS" == msg or "OK" == msg:
            return
        data = msg.split("=")
        if None == data or len(data) != 2:
            print("bad automata message")
            return

        channel: int = int(data[0])
        on: bool = "ON" == data[1]
        self.hass.bus.async_fire(
            EVENT_AUTOMATA_BOX_CHANGE + self.name, {"channel": channel, "on": on}
        )

    def Send(self, data: bytearray):
        self.tcp.Send(self.name, data)

    def SendStatus(self):
        self.Send(b"[STATUS]")

    def SendOK(self):
        self.Send(b"[OK]")

    def SendON(self, idx: int):
        self.Send((f"[{idx}=ON]").encode("utf-8"))

    def SendOFF(self, idx: int):
        self.Send((f"[{idx}=OFF]").encode("utf-8"))


class Automata:
    def __init__(self, hass: HomeAssistant, db: DB, tcp: TCP, config: dict):
        self.hass = hass
        self.db = db
        self.tcp = tcp
        self.config = config.get("automata")
        self.boxes = {}
        self.lock = threading.Lock()
        for box in self.config or []:
            b = AutomataBox(hass, db, tcp, box, self.lock)
            self.boxes[b.name] = b

    def send(self, call):
        print("send", call)
        try:
            data = call.data
            box = self.boxes[data.get("name")]
            if None != box:
                strData: str = data.get("data")
                if None != strData:
                    box.Send(strData.encode("utf-8"))

        except Exception as ex:
            print("send fail", ex)


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
        self.async_write_ha_state()

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
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs):
        self._on = False
        self._box.SendOFF(self._channel)
        self.async_write_ha_state()

    def async_update(self):
        pass


class AutomataLight(LightEntity, RestoreEntity):
    def __init__(self, conx, light):
        self._conx = conx
        self._db = conx.db
        self._automata: Automata = conx.automata

        # Fixture configuration
        self._boxName = light.get("boxName")
        self._box: AutomataBox = self._automata.boxes[self._boxName]
        self._channel = light.get("channel")
        self._name = light.get(CONF_NAME)

        self._on = None
        self._features = 0

    async def async_added_to_hass(self):
        await super().async_added_to_hass()
        if self._on is not None:
            return

        state = await self.async_get_last_state()
        self._on = state and state.state == STATE_ON

    @property
    def name(self):
        return self._name

    @property
    def is_on(self):
        return self._on

    @property
    def supported_features(self):
        return self._features

    @property
    def should_poll(self):
        return False

    async def async_turn_on(self, **kwargs):
        self._on = True
        if self._box is not None:
            self._box.SendON(self._channel)
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs):
        self._on = False
        if self._box is not None:
            self._box.SendOFF(self._channel)
        self.async_write_ha_state()

    def async_update(self):
        pass
