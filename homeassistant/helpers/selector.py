"""Selectors for Home Assistant."""
from typing import Any, Callable, Dict, cast

import voluptuous as vol

<<<<<<< HEAD
<<<<<<< HEAD
=======
from homeassistant.const import CONF_MODE, CONF_UNIT_OF_MEASUREMENT
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
from homeassistant.const import CONF_MODE, CONF_UNIT_OF_MEASUREMENT
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
from homeassistant.util import decorator

SELECTORS = decorator.Registry()


def validate_selector(config: Any) -> Dict:
    """Validate a selector."""
    if not isinstance(config, dict):
        raise vol.Invalid("Expected a dictionary")

    if len(config) != 1:
        raise vol.Invalid(f"Only one type can be specified. Found {', '.join(config)}")

    selector_type = list(config)[0]

<<<<<<< HEAD
<<<<<<< HEAD
    seslector_class = SELECTORS.get(selector_type)

    if seslector_class is None:
        raise vol.Invalid(f"Unknown selector type {selector_type} found")

    return cast(Dict, seslector_class.CONFIG_SCHEMA(config[selector_type]))
=======
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
    selector_class = SELECTORS.get(selector_type)

    if selector_class is None:
        raise vol.Invalid(f"Unknown selector type {selector_type} found")

    # Selectors can be empty
    if config[selector_type] is None:
        return {selector_type: {}}

    return {
        selector_type: cast(Dict, selector_class.CONFIG_SCHEMA(config[selector_type]))
    }
<<<<<<< HEAD
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f


class Selector:
    """Base class for selectors."""

    CONFIG_SCHEMA: Callable


@SELECTORS.register("entity")
class EntitySelector(Selector):
    """Selector of a single entity."""

    CONFIG_SCHEMA = vol.Schema(
        {
<<<<<<< HEAD
<<<<<<< HEAD
            vol.Optional("integration"): str,
            vol.Optional("domain"): str,
=======
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
            # Integration that provided the entity
            vol.Optional("integration"): str,
            # Domain the entity belongs to
            vol.Optional("domain"): str,
            # Device class of the entity
            vol.Optional("device_class"): str,
<<<<<<< HEAD
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
        }
    )


@SELECTORS.register("device")
class DeviceSelector(Selector):
    """Selector of a single device."""

    CONFIG_SCHEMA = vol.Schema(
        {
<<<<<<< HEAD
<<<<<<< HEAD
            vol.Optional("integration"): str,
            vol.Optional("manufacturer"): str,
            vol.Optional("model"): str,
        }
    )
=======
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
            # Integration linked to it with a config entry
            vol.Optional("integration"): str,
            # Manufacturer of device
            vol.Optional("manufacturer"): str,
            # Model of device
            vol.Optional("model"): str,
            # Device has to contain entities matching this selector
            vol.Optional(
                "entity"
            ): EntitySelector.CONFIG_SCHEMA,  # pylint: disable=no-member
        }
    )


@SELECTORS.register("area")
class AreaSelector(Selector):
    """Selector of a single area."""

    CONFIG_SCHEMA = vol.Schema({})


@SELECTORS.register("number")
class NumberSelector(Selector):
    """Selector of a numeric value."""

    CONFIG_SCHEMA = vol.Schema(
        {
            vol.Required("min"): vol.Coerce(float),
            vol.Required("max"): vol.Coerce(float),
            vol.Optional("step", default=1): vol.All(
                vol.Coerce(float), vol.Range(min=1e-3)
            ),
            vol.Optional(CONF_UNIT_OF_MEASUREMENT): str,
            vol.Optional(CONF_MODE, default="slider"): vol.In(["box", "slider"]),
        }
    )


@SELECTORS.register("boolean")
class BooleanSelector(Selector):
    """Selector of a boolean value."""

    CONFIG_SCHEMA = vol.Schema({})


@SELECTORS.register("time")
class TimeSelector(Selector):
    """Selector of a time value."""

    CONFIG_SCHEMA = vol.Schema({})


@SELECTORS.register("target")
class TargetSelector(Selector):
    """Selector of a target value (area ID, device ID, entity ID etc).

    Value should follow cv.ENTITY_SERVICE_FIELDS format.
    """

    CONFIG_SCHEMA = vol.Schema({"entity": {"domain": str}})
<<<<<<< HEAD
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
