"""Constants for the conx integration."""

DOMAIN = "conx"
CONF_IDX = "idx"

EVENT_UNIVERSE_CHANGE = "universe_change_"


def clamp(value, minVal, maxVal):
    return min(maxVal, max(minVal, value))
