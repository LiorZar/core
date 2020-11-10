"""Constants for the conx integration."""

DOMAIN = "conx"
CONF_IDX = "idx"

EVENT_UNIVERSE_CHANGE = "universe_change_"


def clamp(value: float, minVal: float, maxVal: float) -> float:
    if minVal < maxVal:
        return min(maxVal, max(minVal, value))
    return min(minVal, max(maxVal, value))


def fract(value: float) -> float:
    if abs(value - 1.0) <= 0.0001:
        return 1.0
    return value % 1
