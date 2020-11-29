"""Test schemas."""
import logging

import pytest
import voluptuous as vol

from homeassistant.components.blueprint import schemas

_LOGGER = logging.getLogger(__name__)


@pytest.mark.parametrize(
    "blueprint",
    (
        # Test allow extra
        {
            "trigger": "Test allow extra",
            "blueprint": {"name": "Test Name", "domain": "automation"},
        },
        # Bare minimum
        {"blueprint": {"name": "Test Name", "domain": "automation"}},
        # Empty triggers
        {"blueprint": {"name": "Test Name", "domain": "automation", "input": {}}},
        # No definition of input
        {
            "blueprint": {
                "name": "Test Name",
                "domain": "automation",
                "input": {
                    "some_placeholder": None,
                },
            }
        },
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
        # With selector
        {
            "blueprint": {
                "name": "Test Name",
                "domain": "automation",
                "input": {
                    "some_placeholder": {"selector": {"entity": {}}},
                },
            }
        },
        # With min version
        {
            "blueprint": {
                "name": "Test Name",
                "domain": "automation",
                "homeassistant": {
                    "min_version": "1000000.0.0",
                },
            }
        },
<<<<<<< HEAD
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
    ),
)
def test_blueprint_schema(blueprint):
    """Test different schemas."""
    try:
        schemas.BLUEPRINT_SCHEMA(blueprint)
    except vol.Invalid:
        _LOGGER.exception("%s", blueprint)
        assert False, "Expected schema to be valid"


@pytest.mark.parametrize(
    "blueprint",
    (
        # no domain
        {"blueprint": {}},
        # non existing key in blueprint
        {
            "blueprint": {
                "name": "Example name",
                "domain": "automation",
                "non_existing": None,
            }
        },
        # non existing key in input
        {
            "blueprint": {
                "name": "Example name",
                "domain": "automation",
                "input": {"some_placeholder": {"non_existing": "bla"}},
            }
        },
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
        # Invalid version
        {
            "blueprint": {
                "name": "Test Name",
                "domain": "automation",
                "homeassistant": {
                    "min_version": "1000000.invalid.0",
                },
            }
        },
<<<<<<< HEAD
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
    ),
)
def test_blueprint_schema_invalid(blueprint):
    """Test different schemas."""
    with pytest.raises(vol.Invalid):
        schemas.BLUEPRINT_SCHEMA(blueprint)
<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f


@pytest.mark.parametrize(
    "bp_instance",
    (
        {"path": "hello.yaml"},
        {"path": "hello.yaml", "input": {}},
        {"path": "hello.yaml", "input": {"hello": None}},
    ),
)
def test_blueprint_instance_fields(bp_instance):
    """Test blueprint instance fields."""
    schemas.BLUEPRINT_INSTANCE_FIELDS({"use_blueprint": bp_instance})
<<<<<<< HEAD
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
=======
>>>>>>> 5462d6e79818947bb866bd5a53daba9e9a35fe4f
