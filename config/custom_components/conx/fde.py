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
    def __init__(self, hass: HomeAssistant, conx, config: dict):
        self.hass = hass
        self.db: DB = conx.db
        self.tweens: Dict[str, Tween] = {}
        self.services: Dict[str, Callable[[Entity, Any], None]] = {}
        self.services["light.turn_on"] = self.light_turn_on

    def onStop(self):
        pass

    def onTick(self, elapse):
        remove = []
        tws = self.tweens.copy()

        for entity_id in tws:
            tw = tws[entity_id]
            if True == tw.onTick(elapse):
                remove.append(entity_id)

        for entity_id in remove:
            del self.tweens[entity_id]

    def fixRange(self, ran: list):
        if len(ran) >= 3:
            pass
        elif ran[0] < ran[1]:
            ran += [1]
        else:
            ran += [-1]
        ran[1] += ran[2]

    def getEntities(self, id, ran: list) -> list:
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

        if None != ran and type(ran) is list:
            ids = []
            if type(ran[0]) is list:
                for r in ran:
                    self.fixRange(r)
                    ids += list(range(r[0], r[1], r[2]))
            else:
                self.fixRange(ran)
                ids += list(range(ran[0], ran[1], ran[2]))

            idx = 0
            l = len(ids) - 1
            if l <= 0:
                l = 1
            for i in ids:
                eid = id + str(i)
                entity: Entity = self.db.getEntity(eid)
                if None == entity:
                    return None
                entities.append({"id": eid, "entity": entity, "f": idx / l})
                idx = idx + 1
            return entities

        entity: Entity = self.db.getEntity(id)
        if None == entity:
            return None
        entities.append({"id": id, "entity": entity, "f": 0})
        return entities

    def fade(self, call):
        print("fade", call)
        data = None
        service = None
        entities = None
        try:
            data = call.data
            service = self.services.get(data.get("service"))
            if None == service:
                return False

            entities = self.getEntities(data.get("entity_id"), data.get("range"))
            if None == entities:
                return False

        except Exception as ex:
            print("fade fail", ex)

        if None == data or None == service or None == entities:
            print("fade fail, bad data")

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

    def light_turn_on(self, entity: Entity, props):
        try:
            return asyncio.run_coroutine_threadsafe(
                entity.async_turn_on(**props), self.hass.loop
            ).result()
        except Exception as e:
            print("light_turn_on failed", e, props)
