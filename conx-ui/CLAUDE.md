# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Conx is a collection of custom Lovelace card components for Home Assistant. It provides advanced UI controls (dimmers, color pickers, softkeys, radio buttons, sliders) as Web Components built with TypeScript namespaces. This repo is focused on frontend improvements to the Home Assistant UI.

## Build

```bash
tsc
```

This compiles all TypeScript into a single concatenated bundle at `scripts/conx.js` with source maps. There is no package.json, bundler, or test framework — just the TypeScript compiler using `tsconfig.json`.

Output files: `scripts/conx.js`, `scripts/conx.js.map`, `scripts/conx.css`

## Deployment

Build output in `scripts/` is **hardlinked** to `D:\HASS\core\config\www\` — a build
automatically updates what HA serves. No manual copy needed.

## Architecture

### Namespace-based module system (no ES modules)

All code lives under the `conx` namespace. `tsconfig.json` uses `"module": "none"` and `"outFile"` to concatenate everything into one file. Load order is controlled by `/// <reference path="..." />` directives in `conx.ts`.

### Component hierarchy

```
conx.controls.Element (extends HTMLElement)
  └── conx.controls.Svg
        └── conx.controls.Slider

conx.cards.HACard (extends HTMLElement)
  ├── Dimmer, Light_RGB, Light_HSV, Light_CLR
  ├── RadioButtonGroup, Softkeys, SoftkeysCues
  ├── Live, Log, Grid, Space, MaxView
  └── Title, Swatch, Numpad
```

**Controls** (`conx/controls/`) — reusable low-level UI elements (slider, button, toggle, wheel-knob). Base class `Element` handles touch/mouse/pointer events with DPI-aware minimum move thresholds.

**Cards** (`conx/cards/`) — Home Assistant Lovelace cards. Base class `HACard` manages the HA lifecycle: `setConfig()` for configuration, `set hass()` for state updates, entity binding, state change detection, and service call throttling (125ms default).

**Globals** (`conx/glo.ts`) — static utility class with color conversion (RGB/HSV/HEX), DOM helpers (`findChild`, `getChild`, `setStyle`, `setAtts`), path navigation (`get`, `set`, `up`, `top`), YAML/JSON config merging (`fixByYAML`, `fixByJSON`, `fixParams`), and entity selection parsing.

### Home Assistant integration

- **State updates**: HA sets the `hass` property → `checkStateChanged()` → `updateState()` refreshes UI
- **Service calls**: `CallService(domain, service, data)` or `ConxLight(cmd, data)` for light-specific commands
- **Custom WebSocket protocol**: `conx(unq, cmd, data)` sends `{ type: 'conx.cmd', cmd, unq, data }` messages for backend database operations (`db.Get`, `db.Set`, `db.Del`, `db.getStates`, etc.)
- **Stateless cards**: Cards can opt into stateless mode where state is fetched via `db.getStates` instead of the normal HA state pipeline, reducing load for frequently updating entities
- **Last-changer tracking**: `state.attributes.lc` holds a GUID to prevent local echo of self-triggered changes

### Entity selection syntax

Cards accept entity lists in config with a custom syntax:
- Single: `light.kitchen`
- Multiple: `light.kitchen,light.bedroom`
- Ranges: `light.light0>4` expands to light0 through light4
- Arithmetic: `light1;1>3+[4,5]` for union/difference operations

Parsed by `glo.ParseSelection()`.

### Configuration and styling

Cards accept `locals` (component behavior) and `params` (styling/appearance) as JSON attributes. Config supports a `lib` key to reference shared YAML templates from `window.conxlib`, merged via `glo.fixByYAML()`. CSS is applied dynamically through `glo.updateCSS()` and `glo.setStyle()`.

## Key conventions

- All custom elements are prefixed `conx-` (e.g., `conx-slider`, `conx-dimmer`, `conx-radio`)
- Register custom elements at the bottom of each card/control file with `customElements.define()`
- Add new source files as `/// <reference>` directives in `conx.ts` — order matters
- `strictNullChecks` is disabled; `strict` mode is on otherwise
- Touch and mouse events are both handled — controls support mobile and desktop
- `glo.GID` and `glo.Guid()` generate unique identifiers for card instances
