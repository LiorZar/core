import logging
import threading
from typing import Any, Dict

from .const import DOMAIN, EVENT_AUTOMATA_BOX_CHANGE
from .db import DB
from .net import TCP
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)


class AutomataBox:
    def __init__(self, hass: HomeAssistant, db: DB, tcp: TCP, config: dict, lock):
        self.hass = hass
        self.db = db
        self.tcp = tcp
        self.lock = lock
        self.name = config["name"]
        self.ip = config["ip"]
        self.port = config["port"]
        self.type = config["type"]

        self.tcp.Connect(self.name, self.ip, self.port, self.onNet)
        self.Send(b"[STATUS]")

    def onNet(self, cmd: str, data: bytearray):
        print(self.name, cmd, data)
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
        for box in self.config:
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
