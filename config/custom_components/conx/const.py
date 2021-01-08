"""Constants for the conx integration."""

DOMAIN = "conx"
LISTEN_DOMAINS = ["light", "switch", "sensor", "cover"]

EVENT_UNIVERSE_CHANGE = "universe_change_"
EVENT_AUTOMATA_BOX_CHANGE = "automata_box_change_"
EVENT_KINCONY_BOX_CHANGE = "kicony_box_change_"

EPS: float = 0.0001

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