import logging
import asyncio
import threading
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import Entity
from typing import Any, Dict, Callable

from .const import DOMAIN, Del
from .db import DB
from .tween import Tween

_LOGGER = logging.getLogger(__name__)


class FDE:
    def __init__(self, hass: HomeAssistant, conx, config: dict):
        self.hass = hass
        self.db: DB = conx.db
        self.tweens: Dict[str, Tween] = {}
        self.services: Dict[str, Callable[[Entity, Any], None]] = {}
        self.services["async_turn"] = self.async_turn
        self.services["light.turn_on"] = self.light_turn_on
        self.services["switch.turn_on"] = self.switch_turn_on
        self.last = None

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

    def lightParams(self, cycle: float = None, offset: float = None):
        print("lightParams", cycle, offset)
        if None == self.last:
            return

        changed: bool = False
        for p in self.last:
            param = self.last.get(p)
            if True == isinstance(param, dict):
                changed = True
                if None != cycle:
                    param["cycle"] = cycle
                if None != offset:
                    param["offset"] = offset

        if False == changed:
            return
        Del(self.last, "soft")
        self._light(self.last)

    def _light(self, data: dict):
        entities = None
        try:
            print("light", data)
            entities = self.db.GetEntities(data.get("entity_id"))
            if None == entities:
                return False

        except Exception as ex:
            print("light fail", ex)

        if None == data or None == entities:
            print("light fail, bad data")

        try:
            for e in entities:
                en = e["entity"]
                if hasattr(en, "light"):
                    en.light(e["f"], **data)

            self.last = data
            self.db.LastService("conx", "light", data)
        except Exception as ex:
            print("light fail", ex)

    def light(self, call):
        self._light(dict(call.data))

    def fade(self, call):
        data = None
        service = None
        entities = None
        try:
            data = call.data
            print("_fade", data)
            servName = data.get("service")
            if None == servName:
                servName = data.get("Service")
            service = self.services.get(servName)
            if None == service:
                return False

            entities = self.db.GetEntities(data.get("entity_id"))
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
                    data.get("start"),
                    data.get("end"),
                    data.get("transition"),
                    e["f"],
                    data.get("offset"),
                    data.get("ease"),
                    data.get("delay"),
                    data.get("loop"),
                )
                if tw.valid:
                    self.tweens[id] = tw
                    tw.Start()
        except Exception as ex:
            print("fade fail", ex)

    def async_turn(self, entity: Entity, on: bool):
        try:
            if on:
                if hasattr(entity, "async_turn_on"):
                    return asyncio.run_coroutine_threadsafe(
                        entity.async_turn_on(), self.hass.loop
                    )
            else:
                if hasattr(entity, "async_turn_off"):
                    return asyncio.run_coroutine_threadsafe(
                        entity.async_turn_off(), self.hass.loop
                    )
        except Exception as e:
            print("async_turn failed", e, on)

    def light_turn_on(self, entity: Entity, props):
        try:
            return asyncio.run_coroutine_threadsafe(
                entity.async_turn_on(**props), self.hass.loop
            ).result()
        except Exception as e:
            print("light_turn_on failed", e, props)

    def switch_turn_on(self, entity: Entity, props):
        try:
            return asyncio.run_coroutine_threadsafe(
                entity.async_turn_on(**props), self.hass.loop
            ).result()
        except Exception as e:
            print("switch_turn_on failed", e, props)

    def entity_set_state(self, entity: Entity, state):
        try:
            s = state.get("state")
            atts = state.get("atts")
            if "off" != s:
                return asyncio.run_coroutine_threadsafe(
                    entity.async_turn_on(**atts), self.hass.loop
                ).result()
            else:
                return asyncio.run_coroutine_threadsafe(
                    entity.async_turn_off(**atts), self.hass.loop
                ).result()

        except Exception as e:
            print("entity_turn_on failed", e, state)