import logging
import asyncio
import threading
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import Entity
from typing import Any, Dict, Callable

from .const import DOMAIN, Del
from .db import DB
from .fde import FDE

_LOGGER = logging.getLogger(__name__)


class cue:
    def __init__(self, db: DB, name: str, _states: Dict[str, Any] = None):
        self.db: DB = db
        self.name = name
        self._states: Dict[str, Any] = _states or {}

    @property
    def states(self):
        return self._states

    def setStates(self, states: Dict[str, Any]):
        for s in states:
            self._states[s] = states[s]

        self.db.setData("cues", self.name, self._states, True)

    def delEntities(self, entities: list):
        for e in entities:
            Del(self._states, e["id"])

        self.db.setData("cues", self.name, self._states, True)


class CUE:
    def __init__(self, hass: HomeAssistant, conx, config: dict):
        self.hass = hass
        self.db: DB = conx.db
        self.fde: FDE = conx.fde
        self.cues: Dict[str, cue] = {}
        self.loadCues()

    def loadCues(self):
        cues = self.db.getData("cues") or {}
        for name in cues:
            c = cue(self.db, name, cues[name])
            self.cues[name] = c

    def onStop(self):
        pass

    def onTick(self, elapse):
        pass

    def Store(self, call):
        try:
            data = call.data
            name = data.get("name") or self.db.cueName
            transition = data.get("transition") or self.db.transition
            entities = self.db.GetEntities(data.get("entity_id"))
            if None == name or None == entities:
                return False

            states: Dict[str, Any] = {}
            for e in entities:
                en: Entity = e["entity"]
                st = {"state": en.state, "atts": en.state_attributes}
                st["atts"] = st["atts"] or {}
                st["atts"]["transition"] = transition
                states[e["id"]] = st

            c: cue = self.cues.get(name)
            if None == c:
                c = cue(self.db, name)
                self.cues[name] = c
            c.setStates(states)

        except Exception as ex:
            print("Store fail", ex)

    def Play(self, call):
        try:
            data = call.data
            name = data.get("name") or self.db.cueName
            if None == name:
                return False

            c: cue = self.cues.get(name)
            if None == c:
                return False

            for entity_id in c.states:
                entity: Entity = self.db.getEntity(entity_id)
                self.fde.entity_set_state(entity, c.states[entity_id])

        except Exception as ex:
            print("Play fail", ex)

    def Delete(self, call):
        try:
            data = call.data
            name = data.get("name") or self.db.cueName
            if None == name:
                return False

            c: cue = self.cues.get(name)
            if None == c:
                return False

            entities = self.db.GetEntities(data.get("entity_id"))
            if None != entities and len(entities) > 0:
                c.delEntities(entities)
                if len(c.states) > 0:
                    return

            del self.cues[name]
            self.db.delData("cues", name, True)

        except Exception as ex:
            print("Delete fail", ex)
