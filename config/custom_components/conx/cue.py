import logging
import asyncio
import threading
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import Entity
from typing import Any, Dict, Callable

from .const import DOMAIN
from .db import DB
from .fde import FDE

_LOGGER = logging.getLogger(__name__)


class cue:
    def __init__(self, db: DB, name: str, _states: Dict[str, Any] = None):
        self.db: DB = db
        self._name = name
        self._states: Dict[str, Any] = _states or {}

    @property
    def states(self):
        return self._states

    @states.setter
    def states(self, _states: Dict[str, Any]):
        for s in _states:
            self._states[s] = _states[s]

        self.db.setData("cues", self._name, self._states)


class CUE:
    def __init__(self, hass: HomeAssistant, conx, config: dict):
        self.hass = hass
        self.db: DB = conx.db
        self.fde: FDE = conx.fde
        self.cues: Dict[str, cue] = {}
        self.loadCues()

    def loadCues(self):
        cues = self.db.getData("cues")
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
            name = data.get("name")
            entities = self.db.GetEntities(data.get("entity_id"))
            if None == name or None == entities:
                return False

            states: Dict[str, Any] = {}
            for e in entities:
                en: Entity = e["entity"]
                states[e["id"]] = {"state": en.state, "atts": en.state_attributes}

            c: cue = self.cues.get(name)
            if None == c:
                c = cue(self.db, name)
                self.cues[name] = c
            c.states = states

        except Exception as ex:
            print("Store fail", ex)

    def Play(self, call):
        try:
            data = call.data
            name = data.get("name")
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
            name = data.get("name")
            if None == name:
                return False

            c: cue = self.cues.get(name)
            if None == c:
                return False

            del self.cues[name]
            self.db.delData("cues", name)

        except Exception as ex:
            print("Delete fail", ex)
