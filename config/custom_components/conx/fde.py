import logging
import threading
from homeassistant.core import HomeAssistant
from typing import Any, Dict

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

    def fade(self, call):
        print("fade", call)
        data = call.data
        id = data.get("entity_id")
        self.lock.acquire()
        try:
            if None != self.tweens.get(id):
                del self.tweens[id]
            tw = Tween(
                self.hass,
                data.get("service"),
                id,
                data.get("start"),
                data.get("end"),
                data.get("duration"),
                data.get("ease"),
                data.get("delay"),
                data.get("loop"),
                data.get("loopDelay"),
            )
            if tw.valid:
                self.tweens[id] = tw
                tw.Start()
        finally:
            self.lock.release()
