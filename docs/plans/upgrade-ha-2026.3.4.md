# Plan: Upgrade Home Assistant from 2025.9.4 to 2026.3.4

## Context

The ConX project runs on an HA Core fork (`LiorZar/core.git`) currently at version **2025.9.4**.
The latest stable upstream release is **2026.3.4**. This is a ~6 month gap.

The fork has three custom modifications that must be preserved during the upgrade:
1. **websocket_api override** (last synced to HA 2025.7.1)
2. **core.py override** (non-admin script blocking)
3. **Minor outer-repo changes** (Dockerfile, devcontainer, gitignore, package_constraints)

## Pre-Upgrade: Backup

1. Create a backup branch from current state:
   ```bash
   git branch backup/pre-upgrade-2025.9.4
   ```

## Step 1: Merge Upstream into Fork

```bash
git fetch upstream
git merge 2026.3.4
```

Resolve any conflicts in our modified files:
- `.gitignore` — keep our additions (`/config`, `/conx-ui`)
- `.devcontainer/devcontainer.json` — keep our custom config (ports, mounts, extensions)
- `Dockerfile.dev` — accept upstream changes, verify compatibility
- `homeassistant/package_constraints.txt` — accept upstream, re-add any custom constraints

## Step 2: Update Version Constants

File: `homeassistant/const.py` (lines ~26-28)

```python
MAJOR_VERSION: Final = 2026
MINOR_VERSION: Final = 3
PATCH_VERSION: Final = "4"
```

## Step 3: Sync websocket_api Override

The override at `config/components/websocket_api/` was last synced to HA **2025.7.1**.
The upstream `homeassistant/components/websocket_api/` has these changes since then:

### New file to add
- **`automation.py`** (325 lines) — Automation component lookup for triggers/conditions/services by target. Copy from upstream, no custom modifications needed.

### `commands.py` — Merge upstream changes while preserving our customizations

**Upstream changes to incorporate:**
- New imports: `CONF_EXTERNAL_URL`, `target as target_helpers`, `async_condition_from_config`, `async_validate_condition_config`, `async_validate_conditions_config`, `async_initialize_triggers`, `async_validate_trigger_config`
- Import from `.automation` module
- 4 new command registrations: `handle_extract_from_target`, `handle_get_conditions_for_target`, `handle_get_services_for_target`, `handle_get_triggers_for_target`
- Removed template validation from `handle_call_service`
- `handle_get_config` — hide `CONF_EXTERNAL_URL` for `local_only` users
- `handle_manifest_list` — logs errors instead of raising
- `handle_subscribe_entities` — respects filtering in fallback path (new `entity_ids`/`entity_filter` checks)
- `handle_subscribe_trigger` / `handle_test_condition` / `handle_validate_config` — moved circular imports to top-level
- Debug logging added for service call errors
- 4 new handler functions (~100 lines total)

**Our customizations to preserve:**
- `entity_non_admin_perm()` function and its usage in `_async_get_allowed_states()`
- Entity filtering in `handle_subscribe_entities` (our include/exclude filter schema)
- Any ConX-specific command handlers

### `messages.py` — Minor change
- Exception syntax: `except (ValueError, TypeError)` → `except ValueError, TypeError` (3 occurrences)

### `manifest.json` — Update version
- Update version string to match 2026.3.4

### Files with NO upstream changes (keep as-is)
- `__init__.py`, `auth.py`, `connection.py`, `const.py`, `decorators.py`, `error.py`, `http.py`, `sensor.py`, `util.py`

## Step 4: Sync core.py Override

File: `config/components/core.py`

**Our modification** (non-admin script blocking, around line ~2724):
```python
if (
    domain == "script"
    and context is not None
    and context.user_id is not None
):
    user = await self._hass.auth.async_get_user(context.user_id)
    if user is not None and not user.is_admin:
        raise ServiceNotFound(domain, service) from None
```

**Upstream changes to incorporate:**
- Removed deprecated `ConfigSource` enum and `_DEPRECATED_Config` alias
- Removed `DeferredDeprecatedAlias` imports
- Added docstring to `ReleaseChannel`
- Exception syntax fix: `except (KeyError, ValueError)` → `except KeyError, ValueError`
- `Service` class: added `description_placeholders` field, removed `domain`/`service` from `__slots__`
- `ServiceRegistry.async_register` / `_async_register`: added `description_placeholders` parameter
- Removed deprecated `__getattr__`, `__dir__`, `__all__` at bottom of file

**Strategy:** Copy the upstream 2026.3.4 version of `homeassistant/core.py`, then re-apply our non-admin script blocking patch at the correct location (line numbers will have shifted).

## Step 5: Rebuild Docker Image

```bash
docker build --platform linux/arm64 --build-arg BUILD_ARCH=aarch64 -t "liorzar/conx:2026.3.4" .
```

For local dev testing, rebuild the devcontainer:
```bash
devcontainer up --workspace-folder D:\HASS\core --rebuild
```

## Step 6: Update CLAUDE.md

Update the version table in `D:\HASS\core\CLAUDE.md`:
```
| HA Version | **2026.3.4** |
| Docker image | `liorzar/conx:2026.3.4` |
```

Update `config/components/websocket_api/CLAUDE.md` if new commands were added.

## Verification

1. **Build the devcontainer** and start HA
2. **Check logs** — all three custom integrations (conx, scheduler, websocket_api) should load without errors
3. **Open `http://localhost:8123`** and verify the UI loads
4. **Test ConX** — verify websocket commands work (`conx.cmd`), lights load, DB operations function
5. **Test non-admin blocking** — verify non-admin users cannot run scripts
6. **Test entity filtering** — verify non-admin users see filtered entity lists

## Risk Notes

- **Big version jump** (2025.9 → 2026.3) — there may be breaking changes in HA internals that affect ConX
- **Python version** — 2026.3.4 may require a newer Python than 3.13.2 (check `homeassistant/const.py` in the target)
- **Exception syntax change** — the `except ValueError, TypeError` syntax (without parens) is Python 2 style and will cause `SyntaxError` in Python 3. These should remain as `except (ValueError, TypeError)` — this looks like a bad upstream change that needs investigation
- **Dependencies** — new HA versions may require additional Python packages
