import re
import json
import asyncio
import logging
import threading

from typing import Any, Dict

from attr import has
from homeassistant.util.yaml import load_yaml, save_yaml

from .const import DOMAIN
from .fn import gFN
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import Entity
from homeassistant.helpers.typing import StateType
from homeassistant.helpers.entity_platform import EntityPlatform

_LOGGER = logging.getLogger(__name__)


class DB:
    def __init__(self, hass: HomeAssistant, config: dict):
        self.hass = hass
        self.initStates = {}
        self.platforms: Dict[str, EntityPlatform] = {}
        self.fixtures: Dict[str, Entity] = {}
        self.dataDirty = False
        self.hard = False
        self.saveDuration = 0
        self.selection = ""
        self.cueName = ""
        self.transition: float = 2
        self.hass.states.async_set("conx.selection", "")
        self.hass.states.async_set("conx.cuename", "")
        self.hass.states.async_set("conx.transition", 2)

        try:
            self.data: Dict[str, Any] = load_yaml(self.hass.config.path("db.yaml"))
            gFN.Parse(
                load_yaml(self.hass.config.path("custom_components/conx/fn.yaml"))
            )
        except Exception as e:
            print(e)
            self.data: Dict[str, Any] = {}
            self.save_data()

    def onStop(self):
        self.save_data().result()

    def onTick(self, elapse: float):
        self.saveDuration += elapse
        if not self.hard and (not self.dataDirty or self.saveDuration < 60):
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

    def CueName(self, call):
        self.setCueName(call.data.get("name"))

    def setCueName(self, sel: str):
        self.cueName = sel
        self.hass.states.async_set("conx.cuename", self.cueName)

    def Transition(self, call):
        self.setTransition(call.data.get("value"))

    def setTransition(self, value: float):
        self.transition = value
        self.hass.states.async_set("conx.transition", self.transition)

    def setData(self, group: str, id: str, data, hard: bool = False):
        if None == self.data.get(group):
            self.data[group] = {}
        self.data[group][id] = data
        self.dataDirty = True
        self.hard = self.hard or hard

    def getData(self, group: str, id: str = None):
        data = None
        g = self.data.get(group)
        if None == id:
            return g
        if None != g:
            data = g.get(id)
        return data

    def delData(self, group: str, id: str = None, hard: bool = False):
        g = self.data.get(group)
        if None == id:
            del self.data[group]
        elif None != g:
            del g[id]
        else:
            return
        self.dataDirty = True
        self.hard = self.hard or hard

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

    def ParseSelection(self, selection: str, emptyName: bool = False):
        names = []
        if None == selection or len(selection) <= 0:
            selection = self.selection
        entities = selection.split(",")

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
