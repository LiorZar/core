"""Constants for the conx integration."""

DOMAIN = "conx"
LISTEN_DOMAINS = ["light", "switch", "sensor", "cover"]

EVENT_UNIVERSE_CHANGE = "universe_change_"
EVENT_AUTOMATA_BOX_CHANGE = "automata_box_change_"
EVENT_KINCONY_BOX_CHANGE = "kicony_box_change_"

from voluptuous import Invalid


def clamp(value: float, minVal: float, maxVal: float) -> float:
    if minVal < maxVal:
        return min(maxVal, max(minVal, value))
    return min(minVal, max(maxVal, value))


def fract(value: float) -> float:
    if abs(value - 1.0) <= 0.0001:
        return 1.0
    return value % 1


def IsIdOrIds(value):
    if isinstance(value, int):
        return value

    if isinstance(value, list) and len(value) > 0 and isinstance(value[0], int):
        return value
    raise Invalid("Not a string with 5 chars")