import logging
import asyncio
import threading
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import Entity
from typing import Any, Dict, Callable

from .const import DOMAIN
from .db import DB
from .tween import Tween

_LOGGER = logging.getLogger(__name__)


class FDE:
    def __init__(self, hass: HomeAssistant, db: DB, config: dict):
        self.hass = hass
        self.db = db
        self.lock = threading.Lock()
        self.tweens: Dict[str, Tween] = {}
        self.services: Dict[str, Callable[[Entity, Any], None]] = {}
        self.services["light.turn_on"] = self.light_turn_on

    def onStop(self):
        pass

    def onTick(self, elapse):
        remove = []
        self.lock.acquire()
        try:
            tws = self.tweens.copy()
        finally:
            self.lock.release()

        for entity_id in tws:
            tw = tws[entity_id]
            if True == tw.onTick(elapse):
                remove.append(entity_id)

        self.lock.acquire()
        try:
            for entity_id in remove:
                del self.tweens[entity_id]
        finally:
            self.lock.release()

    def getEntities(self, id: [str, list]) -> list:
        entities = []
        if type(id) is list:
            idx = 0
            l = len(id) - 1
            if l <= 0:
                l = 1
            for i in id:
                entity: Entity = self.db.getEntity(i)
                if None == entity:
                    return None
                entities.append({"id": i, "entity": entity, "f": idx / l})
                idx = idx + 1
            return entities

        entity: Entity = self.db.getEntity(id)
        if None == entity:
            return None
        entities.append({"id": id, "entity": entity, "f": 0})
        return entities

    def fade(self, call):
        print("fade", call)
        try:
            data = call.data
            service = self.services.get(data.get("service"))
            if None == service:
                return False

            entities = self.getEntities(data.get("entity_id"))
            if None == entities:
                return False

        except Exception as ex:
            print("fade fail", ex)

        self.lock.acquire()
        try:
            for e in entities:
                id = e["id"]
                if None != self.tweens.get(id):
                    del self.tweens[id]
                tw = Tween(
                    self.hass,
                    service,
                    e["entity"],
                    id,
                    e["f"],
                    data.get("start"),
                    data.get("end"),
                    data.get("transition"),
                    data.get("offset"),
                    data.get("ease"),
                    data.get("delay"),
                    data.get("loop"),
                    data.get("loopDelay"),
                )
                if tw.valid:
                    self.tweens[id] = tw
                    tw.Start()
        except Exception as ex:
            print("fade fail", ex)
        finally:
            self.lock.release()

    def light_turn_on(self, entity: Entity, props):
        try:
            return asyncio.run_coroutine_threadsafe(
                entity.async_turn_on(**props), self.hass.loop
            ).result()
        except Exception as e:
            print("light_turn_on failed", e, props)
