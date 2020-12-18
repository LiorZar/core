import logging
import asyncio
import threading
from attr import s

from voluptuous.validators import Boolean

from homeassistant.helpers.entity import Entity
from homeassistant.core import HomeAssistant
from typing import Any, Dict, Callable

from .const import DOMAIN
from .db import DB

_LOGGER = logging.getLogger(__name__)

class Timer:
    def __init__(self, delay:float, once:bool, fn:Callable, data:dict):
        self.delay:float = delay
        self.once:bool = once
        self.elapse:float = 0
        self.fn:float = fn
        self.data = data

    def onTick(self, elapse):
        self.elapse += elapse
        if self.elapse < self.delay:
            return False

        self.elapse = 0
        self.fn(**self.data)

        return self.once


class EXT:
    def __init__(self, hass: HomeAssistant, conx, config: dict):
        self.hass = hass
        self.db: DB = conx.db
        self.timers: Dict[str, Timer] = {}

    def addTimer( self, delay:float, fn:Callable, entity:Entity, data:dict ):
        self.timers[entity.entity_id] = Timer(delay, False, fn, data)

    def remove( self, id:str ):
        t = self.timers.get(id)
        if None != t:
            del self.timers[id]

    def callLater( self, delay:float, fn:Callable, entity:Entity, data:dict, override:bool = False ):
        if False == override and None != self.timers.get(entity.entity_id):
            return
        self.timers[entity.entity_id] = Timer(delay, True, fn, data)

    def onStop(self):
        pass

    def onTick(self, elapse):
        remove = []
        timers = self.timers.copy()

        for id in timers:
            t = timers[id]
            if True == t.onTick(elapse):
                remove.append(id)

        for id in remove:
            self.remove( id )

