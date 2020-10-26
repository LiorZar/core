import json
import logging
import threading
import sqlalchemy
from sqlalchemy.orm import scoped_session, sessionmaker

from .const import DOMAIN
from homeassistant.core import HomeAssistant
from homeassistant.components.recorder import CONF_DB_URL, DEFAULT_DB_FILE, DEFAULT_URL

_LOGGER = logging.getLogger(__name__)


class DB:
    def __init__(self, hass: HomeAssistant, config: dict):
        self.hass = hass
        self.initStates = {}
        self.connections = {}
        db_url = config.get(CONF_DB_URL)
        if not db_url:
            db_url = DEFAULT_URL.format(
                hass_config_path=hass.config.path(DEFAULT_DB_FILE)
            )

        try:
            self.engine = sqlalchemy.create_engine(db_url)
            conn = self.connection()
            result = conn.execute(
                "SELECT s.entity_id, s.state, s.attributes FROM states s INNER JOIN (SELECT max(state_id) id, entity_id FROM states group by entity_id) d on s.state_id = d.id;"
            )
        except Exception as e:
            _LOGGER.warning("DB exc: %s", e)
            print(e)
        else:
            for res in result:
                self.initStates[res._row[0]] = {
                    "state": res._row[1],
                    "atts": json.loads(res._row[2]),
                }

        print(self.initStates)

    def onTick(self, elapse: float):
        pass

    def connection(self):
        id = threading.get_ident()
        conn = self.connections.get(id)
        if None == conn:
            conn = self.engine.connect()
            self.connections[id] = conn
        return conn

    def get_state(self, id):
        return self.initStates.get(id)

    def restore_state(self, call):
        print("restore_state", call)
        id = call.data.get("id")
        if id == None:
            _LOGGER.error("service:restore, no id")
            return None

        state = self.initStates.get(id)
        if state == None:
            _LOGGER.error("service:restore, no state")
            return None

        attr = call.data.get("attr")
        if attr == None:
            return state.get("state")

        return state.get("atts").get(attr)

    def save_state_srv(self, call):
        unique = call.data.get("id")
        value = call.data.get("state")
        if id == None or value == None:
            _LOGGER.error("service:save_state, bad input")
            return None

        self.save_state(unique, value)

    def save_state(self, unique, value):
        print("save_state", unique, value)

        try:
            result = self.connection().execute(
                f"INSERT INTO states (domain, entity_id, state, attributes, last_changed, last_updated, created) values ('{DOMAIN}', '{unique}', '{value}', '{{}}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);"
            )
        except Exception as e:
            print(e)
        else:
            print(result)
            result.close()
