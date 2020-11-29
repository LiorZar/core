"""Constants used by multiple Tasmota modules."""
CONF_DISCOVERY_PREFIX = "discovery_prefix"

DATA_REMOVE_DISCOVER_COMPONENT = "tasmota_discover_{}"
DATA_UNSUB = "tasmota_subscriptions"

DEFAULT_PREFIX = "tasmota/discovery"

DOMAIN = "tasmota"

PLATFORMS = [
    "binary_sensor",
<<<<<<< HEAD
<<<<<<< HEAD
=======
    "cover",
    "fan",
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
    "cover",
    "fan",
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
    "light",
    "sensor",
    "switch",
]

TASMOTA_EVENT = "tasmota_event"
