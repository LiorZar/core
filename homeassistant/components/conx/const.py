"""Constants for the conx integration."""

DOMAIN = "conx"
LISTEN_DOMAINS = ["light", "switch", "sensor", "cover"]

EVENT_CONX_PROXY = "conx_proxy"
EVENT_CONX_DB_RELOAD = "db_reload"
EVENT_CONX_DB_CHANGE = "db_change"
EVENT_CONX_UNIVERSE_CHANGE = "conx_universe_change"
EVENT_CONX_AUTOMATA_BOX_CHANGE = "conx_automata_box_change"
EVENT_CONX_KINCONY_BOX_CHANGE = "conx_kicony_box_change"

EPS: float = 0.0001
WRITE_STATE_TS: float = 0.333

from voluptuous import Invalid


def clamp(value: float, minVal: float, maxVal: float) -> float:
    if minVal < maxVal:
        return min(maxVal, max(minVal, value))
    return min(minVal, max(maxVal, value))


def zclamp(value: float) -> float:
    return clamp(value, 0.0, 1.0)


def mix(f: float, s: float, e: float) -> float:
    return clamp(s * (1 - f) + e * f, s, e)


def fract(value: float) -> float:
    if abs(value - 1.0) <= EPS:
        return 1.0
    return value % 1


def Get(data: dict, key, default=0.0):
    if key in data:
        return data[key]
    return default


def Del(data: dict, key):
    if None != data.get(key):
        del data[key]


def IsIdOrIds(value):
    if isinstance(value, int):
        return value

    if isinstance(value, list) and len(value) > 0 and isinstance(value[0], int):
        return value
    raise Invalid("Not a string with 5 chars")