# ConX Project

ConX — a professional lighting control system built as a Home Assistant custom integration.
Provides DMX/Art-Net output, hardware I/O (Automata, Kincony), cue/timeline playback,
fade engine, and a WebSocket command interface for a custom frontend.

## Three Repos

| Name | Location | Repo | Purpose |
|------|----------|------|---------|
| **Main repo** | `D:\HASS\core` | `LiorZar/core.git` (fork of `home-assistant/core`) | HA Core runtime. Do **NOT** modify unless explicitly asked. |
| **Inner repo** | `D:\HASS\core\config` | `LiorZar/conx.git` | **All development here.** Python components, YAML configs, frontend assets. |
| **UI** | `D:\HASS\core\config\conx-ui` | Folder inside inner repo | TypeScript frontend. Compiles with `tsc` to `scripts/conx.js`. |

> **Rule:** Never modify files outside `config/` unless explicitly asked.
> **Rule:** This repo (core) is **public**. The inner repo (config) and conx-ui contain proprietary code and must stay **private**. Never commit private code to the outer repo or expose it in public commits/PRs.

## Docker & Development Workflow

- The project runs inside a Docker devcontainer. **Claude handles all Docker operations** —
  building, starting, restarting, exec-ing commands, etc. The user should never need to
  deal with Docker directly.
- `D:\HASS\core` is volume-mounted into the container — editing files locally automatically
  updates them inside the container. No need to copy files in.
- **Always prefer changes inside our own folders** (`config/components/`, `config/conx/`,
  `config/www/`). Avoid touching HA core files unless absolutely necessary.

## Running, Viewing & Testing

- **No tests or linting configured.** Verification is done by running HA and checking the UI + logs.
- **Claude manages the full run/test cycle** — start the container, restart HA, check logs,
  verify changes. The user should not need to do any of this manually.
- HA frontend: **`http://localhost:8123`**
- Use `agent-browser` to open the HA UI, take screenshots, click through pages, and
  visually verify changes.
- Check HA logs inside the container (`docker exec`, etc.) to confirm components loaded
  without errors.
- After changing components: run `copy.bat` (copies `components/` → `custom_components/`),
  restart HA, then verify.

## Deploying Components

```bash
# Copy components/ -> custom_components/ for HA to load
config/components/copy.bat
```

- `components/` is the **git-tracked** source of truth.
- `custom_components/` is a **runtime copy** (gitignored).
- **Always edit `components/`, never `custom_components/`.**

## Frontend Build

Source: `D:\HASS\core\config\conx-ui` — TypeScript namespaces (`"module": "none"`, `"outFile"` concatenation).

```bash
# One-time build
cd D:/HASS/core/config/conx-ui && tsc

# Watch mode
cd D:/HASS/core/config/conx-ui && tsc --watch
```

Output: `config/conx-ui/scripts/conx.js` + `conx.js.map`.

**Hardlinks** connect the build output to `config/www/`:
- `config/conx-ui/scripts/conx.js` ↔ `config/www/conx.js`
- `config/conx-ui/scripts/conx.js.map` ↔ `config/www/conx.js.map`
- `config/conx-ui/scripts/conx.css` ↔ `config/www/conx.css`
- `config/conx-ui/scripts/conxlib.js` ↔ `config/www/conxlib.js`

A build automatically updates what HA serves. No manual copy needed.

`conxlib.js` and `conx.css` are standalone — edit directly, not part of the tsc build.

## HA Version Upgrades

| Field | Value |
|-------|-------|
| HA Version | **2026.3.4** |
| Docker image | `liorzar/conx:2026.3.4` |
| Platform | `linux/arm64` (aarch64) |

**Claude handles HA version upgrades** when asked. Two-step workflow:

1. **Sync the fork from upstream:**
   - `git fetch upstream` — get latest from `home-assistant/core`
   - Merge or rebase the desired release/tag into the local `dev` branch
   - Push to `origin` (`LiorZar/core.git`) to keep the fork up to date
2. **Update locally:**
   - Pull the updated fork into the local working copy
   - Update the version in `homeassistant/const.py` (`MAJOR_VERSION`, `MINOR_VERSION`, `PATCH_VERSION`)
   - **Manually sync `websocket_api` override** with upstream changes (see below)
   - Rebuild the Docker image if needed

Git remotes:
- `origin` → `https://github.com/LiorZar/core.git` (our fork)
- `upstream` → `https://github.com/home-assistant/core.git` (official HA)

## Architecture

### ConX Subsystem Tree

```
ConX (Thread, 50Hz tick)
  ├── DB        — YAML database manager (cues, timelines, radio, sliders, softkeys)
  ├── DMX       — Art-Net universe manager (UDP broadcast)
  │   └── Universe[]
  ├── FDE       — Fade engine (manages active Tweens per entity)
  │   └── Tween[] — per-entity interpolation (brightness, color, effects)
  ├── CUE       — Cue store/recall + timeline sequencer
  ├── EXT       — Timer system for delayed/repeating actions
  ├── UDP/TCP   — Network I/O layer (sensors, device connections)
  ├── Automata  — Automata hardware boxes (TCP, relay/input boards)
  └── Kincony   — Kincony relay boards (TCP)
```

### Data Flow

```
Frontend (conx.js)
  ──WebSocket──► conx.cmd ──dot-notation──► ConX.subsystem.Method(**data)

HA Automations
  ──Services───► conx.light / conx.fade / etc
                                            │
                                  ConX Thread (50Hz tick)
                                    ├── DB.onTick()     → auto-save YAML
                                    ├── FDE.onTick()    → fade/tween updates
                                    ├── DMX.onTick()    → Art-Net UDP broadcast
                                    ├── CUE.onTick()    → timeline sequencer
                                    ├── TCP.onTick()    → Automata/Kincony keepalive
                                    ├── UDP.onTick()    → sensor polling
                                    └── EXT.onTick()    → timers
```

### WebSocket Command Protocol

Frontend sends: `{"type": "conx.cmd", "cmd": "db.Get", "data": {"path": "radio"}, "unq": "..."}`
The `cmd` string is dot-notation traversed on the ConX object tree: `self.db.Get(path="radio")`.

### Selection Syntax

Used throughout services and frontend to select entities compactly:
- `light_;1>16` → `light_1` through `light_16`
- `light_;1>10|2` → `light_1, light_3, light_5, ...` (step 2)
- `light_;1>10-5` → lights 1-10 excluding 5
- Parsed by `parseSelection()` in `components/conx/const.py`

### Key Services (conx domain)

- `conx.light` / `conx.match` — parametric light control with effects
- `conx.fade` — generic entity fade with easing
- `conx.cuestore` / `conx.cueplay` / `conx.cuedelete` — cue management
- `conx.timeline*` — timeline sequencer operations
- `conx.channel` / `conx.universe` — direct DMX control
- `conx.sendto` / `conx.serialto` — raw UDP/serial output
- `conx.db_set` / `conx.db_get` / `conx.db_rename` — database CRUD
- `conx.radio_set` — radio button group state
- `conx.reload` — reload YAML databases from disk

### YAML Databases (managed by DB class)

Auto-saved periodically (configurable `save_duration`, default 60s).
`db_dmx.yaml` and `db_cues?.yaml` are gitignored.

- `db_cues.yaml` — saved lighting cues
- `db_timelines.yaml` / `db_timelinesStates.yaml` — timelines + playback state
- `db_sk.yaml` — soft keys (UI button groups/folders/scripts)
- `db_radio.yaml` — radio button groups
- `db_dmx.yaml` — DMX channel snapshots
- `db_slider.yaml` — slider mappings

## Component File Reference

### conx (Main Integration — ~6k lines Python)

| File | Purpose |
|------|---------|
| `__init__.py` | Setup, service registration, websocket handler, ConX thread |
| `const.py` | Constants, `parseSelection`, `clamp`, `mix`, `fract`, `loadyaml_async` |
| `db.py` | `DB` class — YAML persistence, entity state tracking |
| `dmx.py` | `DMX` + `Universe` — Art-Net protocol sender |
| `dmxLight.py` | `DMXLight` — HA LightEntity backed by DMX channels |
| `udpLight.py` | `UDPLight` — LightEntity controlled via UDP |
| `fde.py` | `FDE` — Fade engine, manages Tween instances |
| `tween.py` | `Tween` + `Ease` — Interpolation, easing, effects |
| `fn.py` | `Fn` + `FNS` — Fade curve lookup tables |
| `cue.py` | `CUE` — Cue store/recall + timeline sequencer |
| `ext.py` | `EXT` — Timer system |
| `net.py` | `TCP`, `UDP`, `UDPSocket`, `UDPSensor`, `Trigger` |
| `automata.py` | Automata hardware (boxes, lights, sensors, switches) |
| `kincony.py` | Kincony relay boards |
| `artnetSensor.py` | Art-Net packet receiver → trigger mapping |
| `light.py` / `sensor.py` / `switch.py` | HA platform setup |
| `services.yaml` | Service definitions |

### websocket_api (HA Override)

Replaces the built-in `websocket_api` to add:
1. **Entity filtering on `subscribe_entities`** — include/exclude filter schemas (not just entity_ids)
2. **Non-admin entity filtering** — hides `automation.*` and `script.*` from non-admin users
   (unless user ID is in entity's `allowed_users` attribute)
3. **User connection tracking** (`DATA_USER_CONNECTIONS`) — maps `user.id` → `ActiveConnection`
4. Additional commands: `subscribe_trigger_platforms`, `integration_wait`, `integration_descriptions`

**Must be manually synced with upstream HA on version upgrades.**

### Other Components

- `scheduler/` — third-party (nielsfaber v3.3.9), do not modify
- `core.py` — copy of `homeassistant/core.py` with non-admin script blocking (~line 2724)

## Frontend Architecture (D:\HASS\core\config\conx-ui)

Namespace-based TypeScript (`conx.*`), no ES modules, no bundler.

### Component Hierarchy

```
conx.controls.Element (extends HTMLElement)
  └── conx.controls.Svg → conx.controls.Slider

conx.cards.HACard (extends HTMLElement)
  ├── Dimmer, Light_RGB, Light_HSV, Light_CLR
  ├── RadioButtonGroup, Softkeys, SoftkeysCues
  ├── Live, Log, Grid, Space, MaxView
  └── Title, Swatch, Numpad
```

- **Controls** (`conx/controls/`) — reusable UI elements (slider, button, toggle, wheel-knob)
- **Cards** (`conx/cards/`) — HA Lovelace cards. `HACard` manages HA lifecycle
- **Globals** (`conx/glo.ts`) — color conversion, DOM helpers, path navigation, config merging
- Custom elements prefixed `conx-` (e.g., `conx-slider`, `conx-dimmer`)
- Load order via `/// <reference path="..." />` directives in `conx.ts`

## Device Configuration (config/conx/)

```
conx/
  devices.yaml          # DMX universes, Automata/Kincony boxes, save_duration
  lights/dmx.yaml       # DMX light entities (channel, type, fade, fixture)
  lights/lights_group.yaml
  sensors/automata.yaml # Automata input sensors
  sensors/udp.yaml      # UDP network sensors
  switches/automata.yaml
  switches/kincony.yaml
```

`configuration.yaml` includes these via `!include`.

## Python Style (Non-Standard)

Matches the owner's TypeScript conventions:
- **camelCase** for variables and private methods
- **PascalCase** for public methods on subsystems
- **Yoda conditions**: `None == x`, `False == hasattr(md, idx)`
- **No type hints** on most parameters
- 4-space indentation, double quotes
- Match surrounding code style exactly when editing

## Docker Build (Production)

```bash
docker build --platform linux/arm64 --build-arg BUILD_ARCH=aarch64 -t "liorzar/conx:<version>" .
docker push liorzar/conx:<version>
```
