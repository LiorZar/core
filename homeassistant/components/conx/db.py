import re
import json
import copy
import asyncio
import logging
import threading
from datetime import datetime
from typing import Any, Dict

from attr import has
from homeassistant.util.yaml import load_yaml, save_yaml

from .const import DOMAIN, EVENT_DB_RELOAD, EVENT_DB_CHANGE
from .fn import gFN
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.typing import StateType
from homeassistant.helpers.entity_platform import EntityPlatform

_LOGGER = logging.getLogger(__name__)


class DB:
    def __init__(self, hass: HomeAssistant, config: dict):
        self.counter: int = 0
        self.hass = hass
        self.initStates = {}
        self.platforms: Dict[str, EntityPlatform] = {}
        self.fixtures: Dict[str, Entity] = {}
        self.dataDirty = False
        self.hard = False
        self.saveDuration = 0
        self.selection = ""
        self.name = ""
        self.lastCall: Any = None
        self.transition: float = 2
        self.hass.states.async_set("conx.selection", "")
        self.hass.states.async_set("conx.name", "")
        self.hass.states.async_set("conx.transition", 2)

        self.Reload(None)

    def Reload(self, call):
        try:
            self.data: Dict[str, Any] = load_yaml(self.hass.config.path("db.yaml"))
            gFN.Parse(load_yaml(self.hass.config.path("fn.yaml")))
            self.Get("cues", True)
            self.Get("timelines", True)
            self.Get("sk", True)
            self.Get("dmx", True)
            self.hass.bus.async_fire(EVENT_DB_RELOAD)
        except Exception as e:
            print(e)
            self.data: Dict[str, Any] = {}
            self.save_data()

    def onStop(self):
        self.save_data().result()

    def onTick(self, elapse: float):
        self.saveDuration += elapse
        if not self.hard and (not self.dataDirty or self.saveDuration < 10):
            return False
        self.hard = False
        self.dataDirty = False
        self.saveDuration = 0
        self.save_data()
        return True

    def save_data(self):
        return asyncio.run_coroutine_threadsafe(self.async_save_data(), self.hass.loop)

    async def async_save_data(self):
        save_yaml(self.hass.config.path("db.yaml"), self.data)

    def Select(self, call):
        self.setSelection(call.data.get("id"))

    def setSelection(self, sel: str):
        self.selection = sel
        self.hass.states.async_set("conx.selection", self.selection)

    def Name(self, call):
        self.setName(call.data.get("name"))

    def setName(self, sel: str):
        self.name = sel
        self.hass.states.async_set("conx.name", self.name)

    def Transition(self, call):
        self.setTransition(call.data.get("value"))

    def setTransition(self, value: float):
        self.transition = float(value)
        self.hass.states.async_set("conx.transition", self.transition)

    def Create(self, path: str):
        parent = self.data
        data = None
        ids = path.split("/")
        for id in ids:
            data = parent.get(id)
            if None == data:
                data = {}
                parent[id] = data
            parent = data
        self.dataDirty = True
        return data

    def Get(self, path: str, create: bool = False):
        data = self.data
        ids = path.split("/")
        for id in ids:
            data = data.get(id)
            if None == data:
                if False == create:
                    return None
                return self.Create(path)
        return data

    @property
    def time(self) -> str:
        now = datetime.now()
        return now.strftime("%H:%M:%S.%f")[:-3]

    def Log(self, data: str, event: str = "log"):
        self.hass.states.async_set("conx." + event, data + "/" + self.time)

    def Set(self, path: str, value, hard: bool = False) -> bool:
        data = self.data
        ids = path.split("/")
        key = ids[-1]
        ids = ids[:-1]
        for id in ids:
            data = data.get(id)
            if None == data:
                return None
        data[key] = value

        self.dataDirty = True
        self.hard = self.hard or hard
        self.Log(path, EVENT_DB_CHANGE)
        return True

    def Del(self, path: str, hard: bool = False):
        data = self.data
        ids = path.split("/")
        key = ids[-1]
        ids = ids[:-1]
        for id in ids:
            data = data.get(id)
            if None == data:
                return None
        del data[key]

        self.dataDirty = True
        self.hard = self.hard or hard
        self.Log(path, EVENT_DB_CHANGE)

    def LastService(self, domain: str, service: str, data: any):
        if True == data.get("soft"):
            return
        self.lastCall = {"domain": domain, "service": service, "data": data}

    def SaveSK(self, path: str, type: str, idx: int):
        data: Any = None
        sk = {"type": type, "idx": idx}
        if "script" == type:
            if None == self.name or len(self.name) <= 0:
                raise Exception("There is no name")
            if None == self.lastCall:
                raise Exception("There is no script")
            data = copy.deepcopy(self.lastCall)
            data["data"]["soft"] = True
            sk["data"] = data
            self.Set(path + "/" + self.name, sk)
            self.Log(f"soft key {self.name} saved ({type})")
            return "OK"

        if "group" == type:
            if None == self.name or len(self.name) <= 0:
                raise Exception("There is no name")
            if None == self.selection or len(self.selection) <= 0:
                raise Exception("There is no selection")
            data = self.selection
            sk["data"] = data
            self.Set(path + "/" + self.name, sk)
            self.Log(f"soft key {self.name} saved ({type})")
            return "OK"

        if "folder" == type:
            if None == self.name or len(self.name) <= 0:
                raise Exception("There is no name")

            sk["data"] = {}
            self.Set(path + "/" + self.name, sk)
            self.Log(f"soft key {self.name} saved ({type})")
            return "OK"

        if "delete" == type:
            self.Del(path)
            self.Log(f"soft key {self.name} deleted ({type})")
            return "OK"

        raise Exception("There is no legal softkey type")

    def PlaySK(self, path: str, idx: int):
        sk = self.Get(path)
        if None == sk:
            raise Exception("There is no softkey")

        rv: str = self._PlaySK(sk)
        if None == rv:
            raise Exception("There is no legal softkey type")
        return rv

    def _PlaySK(self, sk: Any) -> str:
        type: str = sk["type"]
        data: Any = sk["data"]
        if "script" == type:
            self.hass.async_create_task(
                self.hass.services.async_call(
                    data["domain"], data["service"], data["data"]
                )
            )
            return "OK"

        if "group" == type:
            self.setSelection(data)
            return "OK"

        if "delay" == type:
            return "OK"

        return None

    def getEntity(self, entity_id: str) -> Entity:
        if "$" == entity_id[0]:
            return self.getFixture(entity_id)

        domain = entity_id.split(".")[0]
        platform: EntityPlatform = self.platforms.get(domain)
        if None == platform:
            return None

        return platform.entities.get(entity_id)

    def addFixture(self, entity_id: str, e: Entity):
        self.fixtures[entity_id] = e

    def getFixture(self, entity_id: str) -> Entity:
        entity_id = entity_id[1:]
        return self.fixtures.get(entity_id)

    def toNums(self, seq: str):
        parts = seq.split("|")
        inc: int = 1
        last: int = 1
        sign: int = 1

        if len(parts) > 1:
            inc = int(parts[1])
            last = max(1, inc - 1)

        nums = parts[0].split(">")
        if len(nums) < 2:
            return [int(nums[0])]

        a = int(nums[0])
        b = int(nums[1])
        if a > b:
            inc = -inc
            sign = -sign
            last = -last

        b += last
        return list(range(a, b, inc))

    def ParseSelection(self, selection: Any, emptyName: bool = False):
        names = []
        entities = []
        if None == selection or len(selection) <= 0:
            selection = self.selection

        if isinstance(selection, str):
            entities = selection.split(",")
        elif isinstance(selection, list):
            entities = selection

        for entity in entities:
            parts = entity.split(";")
            if len(parts) < 2:
                names.append(parts[0].strip())
                continue
            if len(parts) > 2:
                continue

            res = []
            name = parts[0].strip()
            if emptyName:
                name = ""
            total = parts[1]
            seqs = re.split("[+-]", total)
            idx: int = 0
            for seq in seqs:
                s = self.toNums(seq)
                i = total.find(seq, idx)
                if i <= 0 or "+" == total[i - 1]:
                    res += s
                else:
                    res = [x for x in res if x not in s]
                idx = max(idx, i + 1)

            for r in res:
                names.append(name + str(r))

        return names

    def GetEntities(self, selection: str) -> list:
        entities = []
        names = self.ParseSelection(selection)

        idx = 0
        l = len(names) - 1
        if l <= 0:
            l = 1
        for name in names:
            entity: Entity = self.getEntity(name)
            if None == entity:
                continue
            entities.append(
                {"id": entity.entity_id, "name": name, "entity": entity, "f": idx / l}
            )
            idx = idx + 1
        return entities

    def GetEntitiesNames(self, selection: str) -> list:
        entities = self.GetEntities(selection)
        names = []
        for e in entities:
            names.append(e.get("id"))
        return names