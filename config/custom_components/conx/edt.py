import logging
import threading
from homeassistant.core import HomeAssistant, Event
from homeassistant.util.yaml import load_yaml, save_yaml
from homeassistant.const import EVENT_STATE_CHANGED
from typing import Any, Dict

from .const import DOMAIN
from .db import DB
from .tween import Tween

_LOGGER = logging.getLogger(__name__)


class EDT:
    def __init__(self, hass: HomeAssistant, conx, config: dict):
        self.hass = hass
        self.db: DB = conx.db
        self.cues: Dict[str, Any] = load_yaml(hass.config.path("cues.yaml"))
        self.domains = {"light": True, "switch": True}
        self.fixtureCount: int = 1
        self.fixtures: list = []
        self.entities: list = []
        self.editorControls: list = [
            "conx.editor",
            "input_boolean.editor",
            "input_boolean.store",
            "input_boolean.light",
            "input_boolean.switch",
            "input_number.lastfixtures",
        ]
        """
        hass.states.async_set("input_text.editor", "Empty")
        hass.states.async_set("input_boolean.editor", "on")
        hass.states.async_set("input_boolean.store", "off")
        hass.states.async_set("input_boolean.light", "on")
        hass.states.async_set("input_boolean.switch", "on")
        hass.states.async_set("input_number.lastfixtures", "1")
        hass.states.async_set("input_text.cue_name", "")
        """

        # hass.bus.async_listen(EVENT_STATE_CHANGED, self.on_state_change)

    def on_state_change(self, event: Event) -> None:
        try:
            if None == event.data or None == event.data["entity_id"]:
                return

            print(event.data["entity_id"])
            entity_id = event.data["entity_id"]
            if entity_id in self.editorControls:
                self.onEditorControls(entity_id, event)
                return

            if False == self.isValidDomain(entity_id):
                return

            self.removeEntity(entity_id)
            self.entities.append(entity_id)
            self.fixtures.append(event.data)
            trim = max(0, len(self.entities) - self.fixtureCount)
            self.entities = self.entities[trim:]
            self.fixtures = self.fixtures[trim:]
            self.refreshSelection()
        finally:
            pass

    def onEditorControls(self, entity_id: str, event: Event) -> None:
        domain = entity_id.split(".")[1]
        if domain in self.domains:
            self.domains[domain] = event.data["new_state"].state == "on"
            return
        if "conx.editor" == entity_id:
            return
        if "input_boolean.editor" == entity_id:
            return
        if "input_boolean.store" == entity_id:
            return
        if "input_number.lastfixtures" == entity_id:
            self.fixtureCount = int(float(event.data["new_state"].state))
            return

    def onStop(self):
        pass

    def onTick(self, elapse):
        pass

    def isValidDomain(self, entity_id: str) -> bool:
        domain = entity_id.split(".")[0]
        if domain in self.domains:
            return self.domains[domain]
        return False

    def removeEntity(self, entity_id: str):
        self.entities = [e for e in self.entities if entity_id != e]
        self.fixtures = [e for e in self.fixtures if entity_id != e["entity_id"]]

    def refreshSelection(self):
        self.hass.states.async_set("input_text.editor", ",".join(self.entities))
