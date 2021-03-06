import re
import logging
import threading
from typing import Any, Dict
from timeit import default_timer as timer

from .const import DOMAIN, EVENT_CONX_AUTOMATA_BOX_CHANGE
from .db import DB
from .net import TCP
from .fde import FDE
from homeassistant.core import HomeAssistant
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.helpers.entity import Entity
from homeassistant.components.switch import SwitchEntity
from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.const import CONF_NAME, CONF_TYPE, STATE_ON, STATE_OFF
from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ATTR_HS_COLOR,
    ATTR_RGB_COLOR,
    ATTR_TRANSITION,
    LightEntity,
    PLATFORM_SCHEMA,
    SUPPORT_BRIGHTNESS,
    SUPPORT_COLOR,
    SUPPORT_TRANSITION,
)
from homeassistant.util.color import color_rgb_to_rgbw
import homeassistant.util.color as color_util

_LOGGER = logging.getLogger(__name__)


class AutomataBox:
    def __init__(self, hass: HomeAssistant, conx, config: dict):
        print("Init AutomataBox", config)
        self.hass = hass
        self.db: DB = conx.db
        self.tcp: TCP = conx.tcp
        self.name = config["name"]
        self.ip = config["ip"]
        self.port = config["port"]
        self.type = config["type"]

        self.tcp.Connect(
            self.name, self.ip, self.port, self.onNetworkMessage, 18, 6, b"[OK]"
        )

    def onNetworkMessage(self, cmd: str, data: bytearray):
        print(self.name, cmd, data)
        if "connected" == cmd:
            self.Send(b"[STATUS]")
            return

        if "read" != cmd or None == data:
            return

        while self.readMsg(data):
            pass

    def readMsg(self, data: bytearray) -> bool:
        msg: str = data.decode("utf-8")
        if len(msg) <= 0:
            return False

        res = re.search(r"\[(.*?)\]", msg)
        if None == res:
            if -1 == msg.find("["):
                print("bad AutomataBox message")
            return False

        msg = res.group(1)
        data[: res.end()] = []
        print("AutomataBox read", msg)

        if "STATUS" == msg or "OK" == msg:
            return True

        data = msg.split("=")
        if None == data or len(data) != 2:
            print("bad AutomataBox message")
            return False

        channel: int = int(data[0])
        on: bool = "ON" == data[1]
        self.hass.bus.async_fire(
            EVENT_CONX_AUTOMATA_BOX_CHANGE,
            {"box": self.name, "channel": channel, "on": on},
        )
        return True

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
    def __init__(self, hass: HomeAssistant, conx, config: dict):
        self.hass = hass
        self.db: DB = conx.db
        self.tcp: TCP = conx.tcp
        self.config = config.get("automata")
        self.boxes = {}
        for box in self.config or []:
            b = AutomataBox(hass, conx, box)
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
    def __init__(self, conx, config):
        self._conx = conx
        self._db: DB = conx.db
        self._fde: FDE = conx.fde
        self._automata: Automata = conx.automata

        self._boxName = config.get("boxName")
        self._box: AutomataBox = self._automata.boxes[self._boxName]
        self._channel = config.get("channel")
        self._name = config.get(CONF_NAME)
        self._on = None
        self._invert: bool = config.get("invert")
        self._match: str = config.get("match")

        conx.hass.bus.async_listen(EVENT_CONX_AUTOMATA_BOX_CHANGE, self.on_box_change)

    def on_box_change(self, event):
        if self._boxName != event.data["box"] or self._channel != event.data["channel"]:
            return
        b = event.data["on"]
        if self._invert:
            b = not b
        self._on = b
        self.async_write_ha_state()
        self.match()

    async def async_added_to_hass(self):
        await super().async_added_to_hass()
        if self._on is not None:
            return

        state = await self.async_get_last_state()
        self._on = state and state.state == STATE_ON
        self.refreshBox()

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
        self.refreshBox()
        self.async_write_ha_state()
        self.match()

    async def async_turn_off(self, **kwargs):
        self._on = False
        self.refreshBox()
        self.async_write_ha_state()
        self.match()

    def refreshBox(self):
        on = self._on if False == self._invert else not self._on
        if True == on:
            self._box.SendON(self._channel)
        else:
            self._box.SendOFF(self._channel)

    def match(self):
        if None == self._match or len(self._match) <= 0:
            return

        entities: list = self._db.GetEntities(self._match)
        for e in entities:
            self._fde.async_turn(e["entity"], self._on)

    def async_update(self):
        pass


class AutomataLight(LightEntity, RestoreEntity):
    def __init__(self, conx, config):
        self._conx = conx
        self._db = conx.db
        self._automata: Automata = conx.automata

        # Fixture configuration
        self._boxName = config.get("boxName")
        self._box: AutomataBox = self._automata.boxes[self._boxName]
        self._channel = config.get("channel")
        self._name = config.get(CONF_NAME)
        self._fixture: str = config.get("fixture")
        self._invert: bool = config.get("invert")

        self._on = None
        self._features = 0
        if None != self._fixture:
            self._db.addFixture(self._fixture, self)

    async def async_added_to_hass(self):
        await super().async_added_to_hass()
        if self._on is not None:
            return

        state = await self.async_get_last_state()
        self._on = state and state.state == STATE_ON
        self.refreshBox()

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

    def refreshBox(self):
        on = self._on if False == self._invert else not self._on
        if True == on:
            self._box.SendON(self._channel)
        else:
            self._box.SendOFF(self._channel)

    async def async_turn_on(self, **kwargs):
        self._on = True
        self.refreshBox()
        self.async_write_ha_state()

    async def async_turn_off(self, **kwargs):
        self._on = False
        self.refreshBox()
        self.async_write_ha_state()

    def async_update(self):
        pass


class Automata4ColorLight(LightEntity, RestoreEntity):
    def __init__(self, conx, config):
        self._conx = conx
        self.tcp: TCP = conx.tcp
        self._name = config.get(CONF_NAME)
        self.ip = config.get("ip")
        self.port = config.get("port")
        self._fixture: str = config.get("fixture")

        self.tcp.Connect(self.unq_name, self.ip, self.port, self.onNetworkMessage)

        self._brightness = 0
        self._rgb = [255, 255, 255]
        self._transition = 0

        self._features = SUPPORT_BRIGHTNESS | SUPPORT_COLOR | SUPPORT_TRANSITION
        self.haTS = timer()

    async def async_added_to_hass(self):
        await super().async_added_to_hass()

        state = await self.async_get_last_state()
        if None != state and None != state.attributes:
            self._brightness = state.attributes.get(ATTR_BRIGHTNESS)
            self._rgb = state.attributes.get(ATTR_RGB_COLOR)
            self._transition = state.attributes.get(ATTR_TRANSITION)

    def onNetworkMessage(self, cmd: str, data: bytearray):
        print(self.name, cmd, data)

    @property
    def name(self):
        return self._name

    @property
    def fixture(self):
        return self._fixture

    @property
    def unq_name(self):
        return "light4color" + self._name

    @property
    def brightness(self):
        return self._brightness

    @property
    def is_on(self):
        return self._brightness > 0

    @property
    def hs_color(self):
        if self._rgb:
            return color_util.color_RGB_to_hs(*self._rgb)
        else:
            return None

    @property
    def supported_features(self):
        return self._features

    @property
    def should_poll(self):
        return False

    @property
    def state_attributes(self):
        data = {}

        hs_color = self.hs_color
        data[ATTR_BRIGHTNESS] = self.brightness
        data[ATTR_HS_COLOR] = (round(hs_color[0], 3), round(hs_color[1], 3))
        data[ATTR_RGB_COLOR] = self._rgb
        data[ATTR_TRANSITION] = self._transition

        return {key: val for key, val in data.items() if val is not None}

    async def async_turn_on(self, **kwargs):
        if len(kwargs) <= 0:
            if self._brightness == 0:
                self._brightness = 255

        # Update state from service call
        if ATTR_BRIGHTNESS in kwargs:
            self._brightness = int(kwargs[ATTR_BRIGHTNESS])

        if ATTR_HS_COLOR in kwargs:
            self._rgb = color_util.color_hs_to_RGB(*kwargs[ATTR_HS_COLOR])

        if ATTR_RGB_COLOR in kwargs:
            fRGB = kwargs[ATTR_RGB_COLOR]
            self._rgb = (int(fRGB[0]), int(fRGB[1]), int(fRGB[2]))

        if ATTR_TRANSITION in kwargs:
            self._transition = int(kwargs[ATTR_TRANSITION])

        self.send4color()

    async def async_turn_off(self, **kwargs):
        if self._brightness > 0:
            self._brightness = 0
        self.send4color()

    def send4color(self):
        self.tcp.Send(
            self.unq_name, (f"[R,{self._rgb[0]},{self._transition}]").encode("utf-8")
        )
        self.tcp.Send(
            self.unq_name, (f"[G,{self._rgb[1]},{self._transition}]").encode("utf-8")
        )
        self.tcp.Send(
            self.unq_name, (f"[B,{self._rgb[2]},{self._transition}]").encode("utf-8")
        )
        self.tcp.Send(
            self.unq_name,
            (f"[W,{self._brightness},{self._transition}]").encode("utf-8"),
        )
        self.writeState()

    def writeState(self):
        ts = timer()
        if ts - self.haTS < 0.125:
            return
        self.haTS = ts
        self.async_write_ha_state()

    def async_update(self):
        pass


class AutomataSensor(BinarySensorEntity, RestoreEntity):
    def __init__(self, conx, config):
        self._conx = conx
        self._db: DB = conx.db
        self._fde: FDE = conx.fde
        self._automata: Automata = conx.automata

        self._boxName = config.get("boxName")
        self._box: AutomataBox = self._automata.boxes[self._boxName]
        self._channel = config.get("channel")
        self._name = config.get(CONF_NAME)
        self._invert: bool = config.get("invert")
        self._match: str = config.get("match")
        self._on = None

        conx.hass.bus.async_listen(EVENT_CONX_AUTOMATA_BOX_CHANGE, self.on_box_change)

    def on_box_change(self, event):
        if self._boxName != event.data["box"] or self._channel != event.data["channel"]:
            return
        b = event.data["on"]
        if self._invert:
            b = not b
        self._on = b
        self.async_write_ha_state()
        self.match()

    async def async_added_to_hass(self):
        await super().async_added_to_hass()
        if self._on is not None:
            return

        state = await self.async_get_last_state()
        self._on = state and state.state == STATE_ON

    def match(self):
        if None == self._match or len(self._match) <= 0:
            return

        entities: list = self._db.GetEntities(self._match)
        for e in entities:
            self._fde.async_turn(e["entity"], self._on)

    @property
    def name(self):
        return self._name

    @property
    def is_on(self):
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


class AutomataWGSensor(Entity):
    def __init__(self, conx, config):
        self._db: DB = conx.db
        self.tcp: TCP = conx.tcp
        self._name = config.get(CONF_NAME)
        self.ip = config.get("ip")
        self.port = config.get("port")

        self._state: str = ""

        self.tcp.Connect(self.unq_name, self.ip, self.port, self.onNetworkMessage)

    def onNetworkMessage(self, cmd: str, data: bytearray):
        print(self.name, cmd, data)
        if "connected" == cmd:
            return

        if "read" != cmd or None == data:
            return

        while self.readMsg(data):
            pass

    def readMsg(self, data: bytearray) -> bool:
        msg: str = data.decode("utf-8")
        if len(msg) <= 0:
            return False

        res = re.search(r"\[(.*?)\]", msg)
        if None == res:
            if -1 == msg.find("["):
                print("bad AutomataWGSensor message")
            return False

        msg = res.group(1)
        data[: res.end()] = []
        print("AutomataWGSensor read", msg)

        if "STATUS" == msg or "OK" == msg:
            return True

        self._state = msg
        self.async_write_ha_state()
        return True

    @property
    def name(self):
        return self._name

    @property
    def unq_name(self):
        return "autoWG" + self._name

    @property
    def state(self):
        return self._state

    @property
    def unit_of_measurement(self):
        return "string"

    @property
    def should_poll(self):
        return False

    def async_update(self):
        pass
