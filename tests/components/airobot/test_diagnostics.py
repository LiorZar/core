<<<<<<<< HEAD:tests/components/velbus/test_diagnostics.py
"""Test Velbus diagnostics."""

import pytest
from syrupy.assertion import SnapshotAssertion
from syrupy.filters import props

from homeassistant.core import HomeAssistant

from . import init_integration

========
"""Test the Airobot diagnostics."""

from syrupy.assertion import SnapshotAssertion

from homeassistant.core import HomeAssistant

>>>>>>>> 2026.3.4:tests/components/airobot/test_diagnostics.py
from tests.common import MockConfigEntry
from tests.components.diagnostics import get_diagnostics_for_config_entry
from tests.typing import ClientSessionGenerator


@pytest.mark.usefixtures("entity_registry_enabled_by_default")
async def test_entry_diagnostics(
    hass: HomeAssistant,
    hass_client: ClientSessionGenerator,
<<<<<<<< HEAD:tests/components/velbus/test_diagnostics.py
    config_entry: MockConfigEntry,
    snapshot: SnapshotAssertion,
) -> None:
    """Test config entry diagnostics."""
    await init_integration(hass, config_entry)

    result = await get_diagnostics_for_config_entry(hass, hass_client, config_entry)

    assert result == snapshot(exclude=props("created_at", "modified_at", "entry_id"))
========
    init_integration: MockConfigEntry,
    snapshot: SnapshotAssertion,
) -> None:
    """Test config entry diagnostics."""
    result = await get_diagnostics_for_config_entry(hass, hass_client, init_integration)

    assert result == snapshot
>>>>>>>> 2026.3.4:tests/components/airobot/test_diagnostics.py
