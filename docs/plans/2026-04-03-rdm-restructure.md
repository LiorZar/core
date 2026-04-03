# RDM Integration Restructure Plan

## Context

The RDM integration (`conx_rdm_scanner`) at `D:\HASS\core\config\components\rdm` is a ~10.6K LOC Home Assistant custom integration for discovering and controlling RDM fixtures via Art-Net. All 30+ Python files sit flat in one directory, and the entire frontend is a single 9,261-line vanilla JavaScript file (`panel.js`) plus a standalone HTML file (`ui.html`). The goal is to make this maintainable by:

1. **Python** — Organize into subpackages (`core/`, `protocol/`, `web/`, `storage/`)
2. **Frontend** — Convert JS to namespace-based TypeScript in `rdm/ui/`, matching the `conx-ui` pattern

---

## Part 1: Python Restructure

### Target Structure

```
rdm/
├── __init__.py              # HA required — setup, service registration
├── config_flow.py           # HA required
├── const.py                 # used everywhere, stays at root
├── manifest.json            # HA required
├── services.yaml            # HA required
├── strings.json             # HA required
├── diagnostics.py           # HA integration point
├── light.py                 # HA platform
├── sensor.py                # HA platform
├── binary_sensor.py         # HA platform
├── button.py                # HA platform
├── number.py                # HA platform
├── select.py                # HA platform
├── text.py                  # HA platform
├── translations/
├── core/
│   ├── __init__.py          # re-exports key symbols
│   ├── models.py            # RdmDevice, GatewayInfo, helpers
│   ├── coordinator.py       # ConxRdmCoordinator
│   ├── discovery.py         # discover_gateway_rdm()
│   └── fixture_profiles.py  # profile loading, PID overrides
├── protocol/
│   ├── __init__.py          # HybridProtocol facade (from protocol.py)
│   ├── artnet_client.py     # UDP Art-Net I/O
│   ├── artnet_packets.py    # Art-Net frame builders
│   ├── rdm_controller.py    # high-level RDM ops
│   ├── rdm_packets.py       # RDM frame builders
│   ├── rdm_parser.py        # RDM response parsing
│   ├── packet_dissectors.py # ArtPoll/TOD parsing
│   ├── transport.py         # DiscoveryTransport interface
│   └── node_registry.py     # gateway tracking
├── web/
│   ├── __init__.py          # async_register_views, async_register_panel
│   ├── _helpers.py          # shared utils, serializers, constants
│   ├── snapshot.py          # ConxSnapshotView, ConxSnapshotPublicView, ConxHeartbeatView
│   ├── access.py            # ConxAccessView
│   ├── layout.py            # ConxLayoutView
│   ├── profiles.py          # ConxProfilesView
│   ├── config_transfer.py   # ConxConfigTransferView + merge helpers
│   ├── lifecycle.py         # ConxDeviceLifecycleView
│   ├── activity_log.py      # ConxUserActivityLogView
│   └── panel.py             # ConxUiView, ConxDeskView, ConxPanelModuleView
├── storage/
│   ├── __init__.py          # re-exports
│   ├── access.py            # AccessManager
│   ├── layout.py            # LayoutManager
│   ├── unavailable.py       # UnavailableManager
│   ├── audit_log.py         # lifecycle event log
│   ├── user_activity_log.py # user action tracking
│   └── debug_store.py       # packet trace ring buffer
└── ui/                      # TypeScript frontend (Part 2)
```

### Dependency Direction (verified — no circular risks)

```
const.py  (leaf — used by everything)
   ↑
core/  (models, fixture_profiles, coordinator, discovery)
   ↑              ↑
protocol/         storage/
   ↑                 ↑
   └──── web/ ───────┘
            ↑
  platform files + __init__.py + diagnostics.py
```

### Import Change Rules

| File moves to | `from .const` becomes | `from .models` becomes | `from .fixture_profiles` becomes |
|---|---|---|---|
| `core/*` | `from ..const` | `from .models` (sibling) | `from .fixture_profiles` (sibling) |
| `protocol/*` | `from ..const` | `from ..core.models` | `from ..core.fixture_profiles` |
| `storage/*` | `from ..const` | `from ..core.models` | N/A |
| `web/*` | `from ..const` | `from ..core.models` | `from ..core.fixture_profiles` |
| Root platforms | unchanged | `from .core.models` | `from .core.fixture_profiles` |

### Execution Steps

**Step 1 — Create subpackage directories**
- Create `core/`, `protocol/`, `web/`, `storage/` with empty `__init__.py` files

**Step 2 — Move core/ files** (lowest dependency layer)
- Move `models.py`, `fixture_profiles.py`, `coordinator.py`, `discovery.py` into `core/`
- Update internal imports: `from .const` → `from ..const`
- `coordinator.py` also needs: `from .protocol import HybridProtocol` → `from ..protocol import HybridProtocol`
- Write `core/__init__.py` with re-exports of key symbols (ConxRdmCoordinator, RdmDevice, GatewayInfo, all model helpers, fixture profile functions)

**Step 3 — Move protocol/ files**
- Move `artnet_client.py`, `artnet_packets.py`, `rdm_controller.py`, `rdm_packets.py`, `rdm_parser.py`, `packet_dissectors.py`, `transport.py`, `node_registry.py` into `protocol/`
- Move `protocol.py` content (HybridProtocol class) into `protocol/__init__.py` — it IS the package's public API
- Update imports: `from .const` → `from ..const`, cross-package refs to `from ..core.models`, `from ..core.fixture_profiles`, `from ..storage.debug_store`
- Sibling imports within protocol/ stay as `from .xxx`

**Step 4 — Move storage/ files**
- Move `access.py`, `layout.py`, `unavailable.py`, `audit_log.py`, `user_activity_log.py`, `debug_store.py` into `storage/`
- Update imports: `from .const` → `from ..const`, `from .models` → `from ..core.models`
- Write `storage/__init__.py` with re-exports

**Step 5 — Split web.py into web/ package**
- Create `web/_helpers.py` with all shared utilities:
  - State version functions (`_bump_state_version`, `bump_state_version`, `_get_state_version`)
  - Path constants (`_UI_PATH`, `_PANEL_PATH`, `_PANEL_MODULE_PATH`, etc.)
  - Request helpers (`_request_user`, `_active_entries`, `_pick_coordinator`, `_NO_CACHE_HEADERS`)
  - Data helpers (`_json_safe`, `_seconds_since`, `_coerce_datetime`, `_gateway_timeout_seconds`)
  - Serializers (`_serialize_device`, `_serialize_gateway`, `_filter_device_payload_for_user`, `_build_snapshot`, `_build_access_payload`, `_build_device_lifecycle_payload`, `_serialize_access_device`)
  - Small helpers (`_group_key`, `_target_key_to_uid_subdevice`, `_sensor_payload`, `_personality_option_label`, `_device_control_payload`)
- Split view classes into separate files (snapshot.py, access.py, layout.py, profiles.py, config_transfer.py, lifecycle.py, activity_log.py, panel.py)
- `config_transfer.py` also gets its private merge/export/import helpers
- `web/__init__.py` gets `async_register_views()`, `async_register_panel()`, and `bump_state_version` re-export

**Step 6 — Update root-level imports**
- `__init__.py`: update all imports to new paths (`from .core.coordinator`, `from .storage.access`, etc.)
- `diagnostics.py`: `from .fixture_profiles` → `from .core.fixture_profiles`
- `config_flow.py`: no changes (only imports from `.const`)
- All 7 platform files: `from .models` → `from .core.models`, `from .fixture_profiles` → `from .core.fixture_profiles`

**Step 7 — Delete original flat files**
- Remove the old files from root that were moved into subpackages
- Keep: `__init__.py`, `const.py`, `config_flow.py`, `diagnostics.py`, `manifest.json`, `services.yaml`, `strings.json`, all 7 platform files, `translations/`

---

## Part 2: Frontend TypeScript Conversion

### Target Structure

```
rdm/ui/
├── tsconfig.json              # main build → scripts/panel.js
├── tsconfig.desk.json         # desk build → scripts/desk.js
├── rdm.ts                     # entry point — /// references for panel build
├── rdm-desk.ts                # entry point — /// references for desk build
├── types.ts                   # ISnapshot, IDevice, IGateway, IAccess, ILayout, IPort, etc.
├── consts.ts                  # APP_TABS, FILTERS, DETAIL_TABS, ACL_FIELDS, PROFILE_SLOT_*
├── utils.ts                   # escapeHtml, formatValue, slug helpers
├── api.ts                     # fetch wrappers (loadSnapshot, loadAccess, loadLayout, etc.)
├── panel/
│   ├── panel.ts               # ConxRdmPanel class — state (m_ prefixed), lifecycle, _render()
│   ├── desk.ts                # desk tab render functions
│   ├── detail.ts              # detail sidebar render functions
│   ├── layout.ts              # layout editor render functions
│   ├── access.ts              # access tab render functions
│   ├── controls.ts            # DMX controls, color picker, sliders
│   ├── dialogs.ts             # lifecycle dialog, import mode, live log
│   └── styles.ts              # CSS string builder function
├── desk/
│   ├── desk-view.ts           # standalone desk custom element (from ui.html)
│   └── desk-styles.ts         # desk view CSS
└── scripts/
    ├── panel.js               # compiled output (hardlinked to rdm/panel.js)
    └── desk.js                # compiled output (hardlinked to rdm/desk.js)
```

### Namespace Structure

```
namespace rdm {
    // types.ts — interfaces
    export interface ISnapshot { ... }
    export interface IDevice { ... }
}
namespace rdm {
    // consts.ts — constants
    export const APP_TABS = ...
}
namespace rdm {
    // utils.ts — helpers
    export function escapeHtml(s: string): string { ... }
}
namespace rdm {
    // api.ts — fetch wrappers
    export function loadSnapshot(hass: any): Promise<ISnapshot> { ... }
}
namespace rdm.panel {
    // panel/desk.ts — render functions taking panel instance
    export function renderDesk(p: ConxRdmPanel): string { ... }
}
namespace rdm.panel {
    // panel/panel.ts — main class
    export class ConxRdmPanel extends HTMLElement { ... }
}
namespace rdm.desk {
    // desk/desk-view.ts — standalone element
    export class DeskView extends HTMLElement { ... }
}
```

### Class Decomposition Strategy

The 9,261-line `ConxRdmPanel` monolith uses the **delegate function pattern**:
- `ConxRdmPanel` class keeps: state properties (m_ prefixed), lifecycle methods, event delegation, `_render()` entry point
- Render methods become free functions in `rdm.panel.*` namespaces that receive the panel instance as first parameter
- Example: `this._renderDesk()` → `rdm.panel.renderDesk(this)` called from `_render()`
- State properties become `public` so delegate functions can access them (with m_ prefix per style guide)

### tsconfig.json (panel build)

```json
{
    "compilerOptions": {
        "target": "es6",
        "module": "none",
        "sourceMap": true,
        "outFile": "scripts/panel.js",
        "outDir": "scripts/",
        "strict": true,
        "strictNullChecks": false,
        "esModuleInterop": true,
        "allowJs": true
    },
    "exclude": ["scripts", "desk"]
}
```

### tsconfig.desk.json (desk build)

```json
{
    "compilerOptions": {
        "target": "es6",
        "module": "none",
        "sourceMap": true,
        "outFile": "scripts/desk.js",
        "outDir": "scripts/",
        "strict": true,
        "strictNullChecks": false,
        "esModuleInterop": true,
        "allowJs": true
    },
    "include": ["types.ts", "consts.ts", "utils.ts", "api.ts", "desk/**/*"],
    "exclude": ["scripts", "panel"]
}
```

### Hardlinks

Same pattern as conx-ui → www/:
- `rdm/ui/scripts/panel.js` ↔ `rdm/panel.js`
- `rdm/ui/scripts/desk.js` ↔ `rdm/desk.js` (and update `web/panel.py` to serve desk.js for the desk view)

### Execution Steps

**Step 1 — Create ui/ project skeleton**
- Create directory structure, `tsconfig.json`, `tsconfig.desk.json`
- Create `rdm.ts` and `rdm-desk.ts` with `/// <reference>` directives

**Step 2 — Extract types and constants**
- Create `types.ts` — define interfaces from the 97 state properties and API response shapes
- Create `consts.ts` — extract APP_TABS, FILTERS, DETAIL_TABS, ACL_FIELDS, PROFILE_SLOT_* constants
- Create `utils.ts` — extract escapeHtml, formatValue, and other standalone helpers

**Step 3 — Extract API layer**
- Create `api.ts` — extract all fetch wrappers (_loadSnapshot, _loadAccess, _loadLayout, _saveLayout, service call wrappers)

**Step 4 — Extract styles**
- Create `panel/styles.ts` — extract the CSS string (currently ~4000 lines embedded in the class)
- Create `desk/desk-styles.ts` — extract CSS from ui.html

**Step 5 — Extract render functions into panel/ files**
- `panel/desk.ts` — desk tab rendering (device cards, fixture table, fault watch)
- `panel/detail.ts` — detail sidebar (overview, sensors, faults, raw)
- `panel/layout.ts` — layout editor (areas, drag-drop, grouping)
- `panel/access.ts` — access tab (users, ACLs, profile builder, shortcuts)
- `panel/controls.ts` — DMX controls, color picker, sliders
- `panel/dialogs.ts` — lifecycle dialog, import mode, live log
- Each file: functions in `namespace rdm.panel` taking panel instance as first param

**Step 6 — Create panel class shell**
- `panel/panel.ts` — ConxRdmPanel with m_ state properties, constructor, connectedCallback, disconnectedCallback, set hass(), _render() calling delegate functions
- Register custom element at bottom

**Step 7 — Convert desk view**
- `desk/desk-view.ts` — extract embedded JS from ui.html into a proper custom element class
- Shares types, consts, utils, api with the panel build

**Step 8 — Build and verify**
- Run `tsc -p tsconfig.json` and `tsc -p tsconfig.desk.json`
- Create hardlinks from `scripts/` to component root
- Update `web/panel.py` path constants if needed

**Step 9 — Delete old files**
- Remove `panel.js` (original hand-written JS) — replaced by compiled output
- Remove `ui.html` — replaced by desk.js (web/panel.py will need to serve a minimal HTML shell that loads desk.js instead of the monolithic ui.html)

### Style Rules (per CLAUDE.md)

- 4 spaces, double quotes, semicolons
- No braces for single-statement if/else/for/while
- else/catch on NEW LINE
- Yoda conditions: `if (0 === count)`
- m_ prefix on private/protected: `private m_snapshot`
- PascalCase public methods: `Render()`, `LoadSnapshot()`
- camelCase private methods: `_handleClick()`, `_render()`
- I prefix on interfaces: `ISnapshot`, `IDevice`
- Explicit return types on all methods
- Named exports only

---

## Execution Order

1. **Python restructure first** (Part 1, Steps 1-7) — no frontend changes, just file moves + import updates
2. **Frontend conversion second** (Part 2, Steps 1-9) — independent of Python restructure

This order allows verifying the Python restructure works before touching the frontend.

---

## Verification

After each part:
1. Run `ruff check` on `rdm/` to catch import errors
2. Run `pytest` on existing tests (update test imports if needed)
3. Deploy to HA (restart container), verify:
   - Integration loads without errors in logs
   - Sidebar panel renders and shows device data
   - Config flow works
   - Snapshot API returns data (`/api/conx_rdm_scanner/snapshot`)
   - Service calls work (identify, set address, etc.)

## Critical Files

- `rdm/web.py` (2038 lines) — largest file, needs splitting into 10+ files
- `rdm/panel.js` (9261 lines) — monolith JS, full TS conversion
- `rdm/ui.html` (1072 lines) — standalone view, convert to TS
- `rdm/__init__.py` (281 lines) — entry point, all imports change
- `rdm/models.py` (555 lines) — imported by 15+ files
- `rdm/coordinator.py` (615 lines) — cross-package import to protocol/
- `rdm/protocol.py` (243 lines) — becomes protocol/__init__.py
