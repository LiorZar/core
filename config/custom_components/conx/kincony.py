import re
import logging
import threading
from typing import Any, Dict

from .const import DOMAIN, EVENT_KINCONY_BOX_CHANGE
from .db import DB
from .net import TCP
from homeassistant.core import HomeAssistant
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.components.switch import SwitchEntity
from homeassistant.components.light import LightEntity
from homeassistant.const import CONF_NAME, CONF_TYPE, STATE_ON, STATE_OFF

_LOGGER = logging.getLogger(__name__)


class KinconyBox:
    def __init__(self, hass: HomeAssistant, conx, config: dict):
        self.hass = hass
        self.db: DB = conx.db
        self.tcp: TCP = conx.tcp
        self.name = config["name"]
        self.ip = config["ip"]
        self.port = config["port"]
        self.type = config["type"]

        self.tcp.Connect(self.name, self.ip, self.port, self.onNetworkMessage)

    def onNetworkMessage(self, cmd: str, data: bytearray):
        print(self.name, cmd, data)
        if "connected" == cmd:
            self.Send(b"RELAY-STATE-255")
            self.Send(b"RELAY-GET_INPUT-255")
            return

        if "read" != cmd or None == data:
            return

        while self.readMsg(data):
            pass

    def readMsg(self, data: bytearray) -> bool:
        msg: str = data.decode("utf-8")
        if len(msg) < 5:
            return False

        if "RELAY" != msg[0:5]:
            print("bad KinconyBox message")
            data[0:5] = []
            return False

        msg = msg[6:]
        arr = msg.split("-")
        if None == arr or len(arr) != 2:
            print("bad KinconyBox message")
            return False

        values = arr[1].split(",")
        if None == values or len(values) < 3:
            print("bad Kincony values")
            return False

        cmd: str = arr[0]
        channel: int = int(values[1])
        value: int = int(values[2])
        data[:] = []

        self.hass.bus.async_fire(
            EVENT_KINCONY_BOX_CHANGE + self.name,
            {"cmd": cmd, "channel": channel, "value": value},
        )
        return True

    def Send(self, data: bytearray):
        self.tcp.Send(self.name, data)

    def SendON(self, idx: int):
        self.Send((f"RELAY-SET-255,{idx},1").encode("utf-8"))

    def SendOFF(self, idx: int):
        self.Send((f"RELAY-SET-255,{idx},0").encode("utf-8"))

    def SendRelayRead(self, idx: int):
        self.Send((f"RELAY-READ-255,{idx}").encode("utf-8"))

    def SendInputRead(self, idx: int):
        self.Send((f"RELAY-GET_INPUT-255,{idx}").encode("utf-8"))


class Kincony:
    def __init__(self, hass: HomeAssistant, conx, config: dict):
        self.hass = hass
        self.db: DB = conx.db
        self.tcp: TCP = conx.tcp
        self.config = config.get("kincony")
        self.boxes = {}
        for box in self.config or []:
            b = KinconyBox(hass, conx, box)
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


class KinconySwitch(SwitchEntity, RestoreEntity):
    def __init__(self, conx, config):
        self._conx = conx
        self._db: DB = conx.db
        self._kincony: Kincony = conx.kincony

        self._boxName = config.get("boxName")
        self._box: KinconyBox = self._kincony.boxes[self._boxName]
        self._channel = config.get("channel")
        self._name = config.get(CONF_NAME)
        self._on = None

        conx.hass.bus.async_listen(
            EVENT_KINCONY_BOX_CHANGE + self._boxName, self.on_box_change
        )

    def on_box_change(self, event):
        if self._channel != event.data["channel"]:
            return
        self._on = 1 == int(event.data["value"])
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


class KinconyLight(LightEntity, RestoreEntity):
    def __init__(self, conx, config):
        self._conx = conx
        self._db: DB = conx.db
        self._kincony: Kincony = conx.kincony

        # Fixture configuration
        self._boxName = config.get("boxName")
        self._box: KinconyBox = self._kincony.boxes[self._boxName]
        self._channel = config.get("channel")
        self._name = config.get(CONF_NAME)
        self._fixture: int = config.get("fixture")

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
    def fixture(self):
        return self._fixture

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
