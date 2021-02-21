import logging
import asyncio
import threading
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import Entity
from typing import Any, Dict, Callable

from .const import DOMAIN, Del, EVENT_DB_RELOAD
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

        self.db.Set("cues/" + self.name, self._states, True)

    def delEntities(self, entities: list):
        for e in entities:
            Del(self._states, e["id"])

        self.db.Set("cues/" + self.name, self._states, True)


class tme:
    def __init__(self, db: DB, name: str, seq: list = None):
        self.db: DB = db
        self.name = name
        self.seq: list = seq or []
        self.active: bool = False
        self.index: int = -1
        self.loop: int = 0
        self.loopIdx: int = 0
        self.elapsed: float = 0
        self.duration: float = 0.01

    def onTick(self, elapse: float):
        if False == self.active:
            return

        self.elapsed += elapse
        if self.duration > 0 and self.elapsed >= self.duration:
            self.Go()

    def Go(self, index: int = None):
        l = len(self.seq)
        if l <= 0:
            self.Stop()
            return

        if False == self.active:
            self.Start()

        if None != index:
            self.index = index
        else:
            self.index = self.index + 1
        if self.index >= l:
            if self.loop <= 0:
                self.index = 0
            else:
                self.loopIdx = self.loopIdx + 1
                if self.loopIdx < self.loop:
                    self.index = 0
                else:
                    self.Stop()
                    return

        sk: Any = self.seq[self.index]
        type = sk["type"]
        self.elapsed = 0
        self.duration = 2 if None == sk["duration"] else sk["duration"]
        self.db._PlaySK(sk)
        self.db.Log(f"timeline {self.name} GO={self.index} type={type}")

    def Start(self, loop: int = None, index: int = None):
        if True == self.active:
            return
        self.loop = loop or 0
        self.index = index or -1
        self.elapsed = 0
        self.duration = 0.01
        self.active = True

    def Stop(self):
        if False == self.active:
            return
        self.active = False
        self.index = -1


class CUE:
    def __init__(self, hass: HomeAssistant, conx, config: dict):
        self.hass = hass
        self.db: DB = conx.db
        self.fde: FDE = conx.fde
        self.cues: Dict[str, cue] = {}
        self.loadData()
        self.hass.bus.async_listen(EVENT_DB_RELOAD, self.loadData)

    def loadData(self, event=None):
        self.cues = {}
        cues = self.db.Get("cues") or {}
        for name in cues:
            c = cue(self.db, name, cues[name])
            self.cues[name] = c

        self.timelines = {}
        timelines = self.db.Get("timelines") or {}
        for name in timelines:
            t = tme(self.db, name, timelines[name])
            self.timelines[name] = t

    def onStop(self):
        pass

    def onTick(self, elapse: float):
        tmes = self.timelines.copy()

        for name in tmes:
            t: tme = tmes[name]
            t.onTick(elapse)

    def Store(self, call):
        name = ""
        try:
            data = call.data
            name = data.get("name") or self.db.name
            transition = float(data.get("transition") or self.db.transition)
            entities = self.db.GetEntities(data.get("entity_id"))
            if None == name or len(name) <= 0 or None == entities:
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
            self.db.LastService("conx", "cueplay", {"name": name})
            self.db.Log(f"cue {name} stored")
        except Exception as ex:
            print("Store fail", ex)
            self.db.Log(f"cue {name} store fail ({str(ex)})")

    def Play(self, call):
        name = ""
        try:
            data = dict(call.data)
            name = data.get("name") or self.db.name
            if None == name:
                return False

            c: cue = self.cues.get(name)
            if None == c:
                return False

            data["name"] = name
            for entity_id in c.states:
                entity: Entity = self.db.getEntity(entity_id)
                self.fde.entity_set_state(entity, c.states[entity_id])
            self.db.LastService(call.domain, call.service, data)
            self.db.Log(f"cue {name} playing")
        except Exception as ex:
            print("Play fail", ex)
            self.db.Log(f"cue {name} play fail ({str(ex)})")

    def Delete(self, call):
        name = ""
        try:
            data = call.data
            name = data.get("name") or self.db.name
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
            self.db.Del("cues", name, True)
            self.db.Log(f"cue {name} deleted")
        except Exception as ex:
            print("Delete fail", ex)
            self.db.Log(f"cue {name} delete fail ({str(ex)})")

    def TimelineStart(self, call):
        name = ""
        try:
            data = dict(call.data)
            name = data.get("name") or self.db.name
            if None == name:
                return False

            t: tme = self.timelines.get(name)
            if None == t:
                return False

            data["name"] = name
            t.Start(data.get("loop"), data.get("index"))
            self.db.LastService(call.domain, call.service, data)
            self.db.Log(f"start timeline {name} playing index {t.index}")
        except Exception as ex:
            print("start timeline fail", ex)
            self.db.Log(f"start timeline {name} fail ({str(ex)})")

    def TimelineStop(self, call):
        name = ""
        try:
            data = dict(call.data)
            name = data.get("name") or self.db.name
            if None == name:
                return False

            t: tme = self.timelines.get(name)
            if None == t:
                return False

            data["name"] = name
            t.Stop()
            self.db.LastService(call.domain, call.service, data)
            self.db.Log(f"stop timeline {name}")
        except Exception as ex:
            print("stop timeline fail", ex)
            self.db.Log(f"stop timeline {name} fail ({str(ex)})")

    def TimelineGo(self, call):
        name = ""
        try:
            data = dict(call.data)
            name = data.get("name") or self.db.name
            if None == name:
                return False

            t: tme = self.timelines.get(name)
            if None == t:
                return False

            data["name"] = name
            t.Go(data.get("index"))
            self.db.LastService(call.domain, call.service, data)
            self.db.Log(f"timeline {name} playing index {t.index}")
        except Exception as ex:
            print("timeline go fail", ex)
            self.db.Log(f"timeline {name} fail ({str(ex)})")