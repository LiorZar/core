# CLAUDE.md Improvement Plan

## Context

`conxlib.js` has been removed from the project. `conx-presets.html` replaced it as the preset/template library. The `conx.css` hardlink between `conx-ui/scripts/` and `www/` is broken (different files, different sizes). The RDM component domain changed from `conx_rdm_scanner` to `rdm` and was restructured into subdirectories. Multiple CLAUDE.md files reference stale information.

## Files to Modify

1. `D:\HASS\core\CLAUDE.md` — root project CLAUDE.md
2. `D:\HASS\core\config\CLAUDE.md` — inner repo CLAUDE.md
3. `D:\HASS\core\config\conx-ui\CLAUDE.md` — frontend project
4. `D:\HASS\core\config\www\CLAUDE.md` — web assets
5. `D:\HASS\core\config\components\rdm\CLAUDE.md` — full rewrite

## Files NOT modified (verified accurate)

- `config/components/conx/CLAUDE.md`
- `config/components/websocket_api/CLAUDE.md`
- `config/components/scheduler/CLAUDE.md`
- `config/conx/CLAUDE.md`
- `config/scheduler-card-ui/CLAUDE.md`

---

## Step 1: Update root CLAUDE.md (`D:\HASS\core\CLAUDE.md`)

### 1a. Fix hardlinks section (lines 73-82)

Replace:
```
**Hardlinks** connect the build output to `config/www/`:
- `config/conx-ui/scripts/conx.js` ↔ `config/www/conx.js`
- `config/conx-ui/scripts/conx.js.map` ↔ `config/www/conx.js.map`
- `config/conx-ui/scripts/conx.css` ↔ `config/www/conx.css`
- `config/conx-ui/scripts/conxlib.js` ↔ `config/www/conxlib.js`

A build automatically updates what HA serves. No manual copy needed.

`conxlib.js` and `conx.css` are standalone — edit directly, not part of the tsc build.
```

With:
```
**Hardlinks** connect the build output to `config/www/`:
- `config/conx-ui/scripts/conx.js` ↔ `config/www/conx.js`
- `config/conx-ui/scripts/conx.js.map` ↔ `config/www/conx.js.map`
- `config/conx-ui/scripts/conx.css` ↔ `config/www/conx.css`

A build automatically updates what HA serves. No manual copy needed.

`conx.css` is standalone — edit directly, not part of the tsc build.
`conx-presets.html` is a standalone preset/template library in `config/www/`.
```

Note: CSS hardlink needs to be re-established (currently broken — different sizes/inodes). The CLAUDE.md should document the intended state.

---

## Step 2: Update config CLAUDE.md (`D:\HASS\core\config\CLAUDE.md`)

### 2a. Fix Key Rule #4 (line 22)

Replace:
```
4. **Frontend source** lives in `conx-ui/` (TypeScript, namespace-based, compiled with `tsc`). Only `conxlib.js` and `conx.css` in `www/` are edited directly.
```

With:
```
4. **Frontend source** lives in `conx-ui/` (TypeScript, namespace-based, compiled with `tsc`). `conx.css` and `conx-presets.html` in `www/` are edited directly.
```

### 2b. Fix frontend build output (line 64)

Replace:
```
Output lands in `scripts/conx.js` + `scripts/conx.js.map`. Copy to `www/` for deployment.

`conxlib.js` and `conx.css` are standalone — edit directly in `www/`.
```

With:
```
Output lands in `scripts/conx.js` + `scripts/conx.js.map`. Hardlinked to `www/` — no copy needed.

`conx.css` and `conx-presets.html` are standalone — edit directly in `www/`.
```

---

## Step 3: Update conx-ui CLAUDE.md (`D:\HASS\core\config\conx-ui\CLAUDE.md`)

### 3a. Fix output files (line 17)

Replace:
```
Output files: `scripts/conx.js`, `scripts/conx.js.map`, `scripts/conx.css`
```

With:
```
Output files: `scripts/conx.js`, `scripts/conx.js.map`

Standalone files (not part of tsc build): `www/conx.css`, `www/conx-presets.html`
```

---

## Step 4: Update www CLAUDE.md (`D:\HASS\core\config\www\CLAUDE.md`)

### 4a. Fix file table — remove conxlib.js, add new files (lines 10-17)

Replace:
```
| `conx.js` | Main frontend bundle (~5200 lines, minified). Includes js-yaml and the conx UI components. Communicates with the backend via the `conx.cmd` websocket command. |
| `conxlib.js` | Template library — predefined UI component configs (swatch presets, popup dialog templates). Referenced by the frontend. |
| `conx.css` | Styles for conx UI components — radio buttons (`.conx-radio`), dimmer buttons (`.conx-dimmer-bn`). Uses CSS custom properties for theming. |
| `DigitalClock.js` | Digital clock widget |
| `codemirror.min.js` | CodeMirror editor (minified) — likely used for YAML/config editing in the UI |
| `images/` | Background/gradient images used by the UI (numbered scene images, gradient overlays) |
| `scheduler-card/` | Third-party scheduler card (nielsfaber) — frontend for the scheduler integration |
| `danor.jpg`, `likis.jpeg`, `logo.jpeg` | Branding/logo images |
```

With:
```
| `conx.js` | Main frontend bundle. Includes js-yaml and the conx UI components. Communicates with the backend via the `conx.cmd` websocket command. |
| `conx.css` | Styles for conx UI components — radio buttons (`.conx-radio`), dimmer buttons (`.conx-dimmer-bn`). Uses CSS custom properties for theming. |
| `conx-presets.html` | Preset/template library — predefined UI component configs (swatch presets, popup dialog templates). Referenced by the frontend. Replaces the former `conxlib.js`. |
| `conx-presets.md` | Documentation for the presets system |
| `style-picker.html` | Style picker UI tool |
| `DigitalClock.js` | Digital clock widget |
| `codemirror.min.js` | CodeMirror editor (minified) — used for YAML/config editing in the UI |
| `images/` | Background/gradient images used by the UI (numbered scene images, gradient overlays) |
| `scheduler-card/` | Third-party scheduler card (nielsfaber) — frontend for the scheduler integration |
| `danor.jpg`, `likis.jpeg`, `logo.jpeg` | Branding/logo images |
```

### 4b. Fix frontend source section (lines 34-48)

Replace:
```
After making changes there, rebuild — hardlinks auto-update these files:
- `conx.js` — the bundled output
- `conx.js.map` — source map for debugging
- `conxlib.js` — template library (edited directly, not bundled)
- `conx.css` — styles (edited directly, not bundled)

When working on frontend changes:
1. Edit the source in `../conx-ui/`
2. Build with `tsc` — hardlinks automatically update `www/`

> `conxlib.js` and `conx.css` are **not** part of the build pipeline — they are
> standalone files that can be edited directly in this folder.
```

With:
```
After making changes there, rebuild — hardlinks auto-update these files:
- `conx.js` — the bundled output
- `conx.js.map` — source map for debugging
- `conx.css` — styles (hardlinked from `conx-ui/scripts/`)

Standalone files (edit directly in this folder, NOT part of the build):
- `conx-presets.html` — preset/template library
- `style-picker.html` — style picker tool
```

---

## Step 5: Rewrite RDM CLAUDE.md (`D:\HASS\core\config\components\rdm\CLAUDE.md`)

Full rewrite. The domain changed from `conx_rdm_scanner` to `rdm`, and the codebase was restructured into `core/`, `protocol/`, `storage/`, `web/`, and `ui/` subdirectories.

Write new content covering:

- **Domain**: `rdm` (was `conx_rdm_scanner`)
- **Directory structure**: `core/`, `protocol/`, `storage/`, `web/`, `ui/` + platform files at root
- **File reference table**: per-subdirectory with file purposes
- **Architecture**: ConxRdmCoordinator → HybridProtocol → ArtNetClient/RdmController → NodeRegistry
- **Discovery flow**: gateway poll → TOD → cached UIDs → manual UIDs → direct discovery → RDM detail queries
- **Services**: identify_device, set_start_address, set_personality, set_device_label, set_dmx_channel_level, reload_fixture_profiles, simulate_fault
- **Entity platforms**: sensor, binary_sensor, button, number, select, light, text
- **Storage layer**: AccessManager, LayoutManager, UnavailableManager, audit logs, debug store
- **Web endpoints**: snapshot, access, layout, lifecycle, config_transfer, profiles, activity_log, panel/desk serving
- **Frontend**: TypeScript in `ui/`, compiled to `panel.js` + `desk.js`, panel registration via `web/panel.py`
- **Config flow**: two-step (basic + advanced), single instance
- **Important limits**: TOD-dependent discovery, 32 DMX slot cap, subdevice probing

---

## Step 6: Fix the CSS hardlink

The CSS hardlink between `conx-ui/scripts/conx.css` and `www/conx.css` is broken. After the CLAUDE.md updates, remind the user to re-establish it:

```bash
# From config/ directory — delete the stale copy and re-link
del conx-ui\scripts\conx.css
mklink /H conx-ui\scripts\conx.css www\conx.css
```

---

## Verification

After applying all changes:
1. Search all CLAUDE.md files for `conxlib` — should return 0 results
2. Verify no stale `conx_rdm_scanner` references remain
3. Spot-check that file references in each CLAUDE.md match actual disk contents
