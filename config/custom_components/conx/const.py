"""Constants for the conx integration."""

DOMAIN = "conx"

EVENT_UNIVERSE_CHANGE = "universe_change_"
EVENT_AUTOMATA_BOX_CHANGE = "automata_box_change_"
EVENT_KINCONY_BOX_CHANGE = "kicony_box_change_"


def clamp(value: float, minVal: float, maxVal: float) -> float:
    if minVal < maxVal:
        return min(maxVal, max(minVal, value))
    return min(minVal, max(maxVal, value))


def fract(value: float) -> float:
    if abs(value - 1.0) <= 0.0001:
        return 1.0
    return value % 1
