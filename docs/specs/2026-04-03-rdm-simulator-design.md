# RDM Simulator — Design Spec

**Date:** 2026-04-03
**Purpose:** Electron app that simulates Art-Net RDM fixtures for testing the ConX RDM integration without real hardware.

## Context

The RDM integration (`config/components/rdm/`) discovers and manages RDM lighting fixtures via Art-Net over UDP. Testing currently requires physical Art-Net gateways and RDM fixtures. This simulator eliminates that dependency by acting as a virtual Art-Net node with configurable RDM fixtures.

## Stack

- **Electron** (main + renderer)
- **TypeScript** throughout
- **HTML Canvas** for fixture visualization
- **Node.js `dgram`** for Art-Net UDP (port 6454)
- **JSON file** for fixture config persistence

## Architecture

```
┌─ Main Process (Node.js) ──────────────────────┐
│                                                 │
│  ArtNetServer (dgram, port 6454)                │
│    ├── ART_POLL → responds with gateway info    │
│    ├── ART_TOD_REQUEST → responds with UID list │
│    ├── ART_DMX → updates fixture channel values  │
│    └── ART_RDM → routes to target fixture        │
│                                                 │
│  FixtureManager                                 │
│    └── Fixture[] (up to 32)                     │
│         ├── RDM state (identity, address, etc.) │
│         ├── DMX channel values (live)            │
│         └── RDM GET/SET command handler          │
│                                                 │
│  ConfigStore                                    │
│    └── JSON file read/write for persistence     │
│                                                 │
├─ IPC (contextBridge) ─────────────────────────│
│                                                 │
├─ Renderer Process ─────────────────────────────┤
│                                                 │
│  Canvas Fixture Grid (~30fps render loop)       │
│    └── FixtureCard[] in responsive grid          │
│         ├── Color swatch (computed RGB output)   │
│         ├── Channel bars (0-255 per channel)     │
│         └── Info: label, address, personality    │
│                                                 │
│  Sidebar (left, collapsible ~280px)             │
│    ├── Gateway config section                    │
│    ├── Fixture list (add/edit/remove)            │
│    └── Edit panel for selected fixture           │
│                                                 │
│  Packet Log (bottom, resizable)                 │
│    └── Scrolling log of Art-Net/RDM traffic      │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Art-Net Protocol Layer

### Gateway Identity (ART_POLL_REPLY)

The simulator responds to ART_POLL (opcode 0x2000) with an ART_POLL_REPLY containing:
- Configurable gateway name (short name + long name)
- IP address (auto-detected or manual)
- Net / Subnet / Universe (user-configurable)
- Firmware version: simulated
- RDM capability flag: enabled
- Output ports: 1 port, RDM-capable

### TOD (Table of Devices)

On ART_TOD_REQUEST (opcode 0x8000):
- Respond with ART_TOD_DATA (opcode 0x8100) containing UIDs of all active fixtures
- Support multi-block responses if >32 UIDs (unlikely at 32 max, but correct)

On ART_TOD_CONTROL flush (opcode 0x8200):
- Re-send the full TOD

### RDM Command Handling

On ART_RDM (opcode 0x8300):
1. Parse the embedded RDM packet (start code 0x01, header, PID, data)
2. Match destination UID to a fixture (or broadcast UID)
3. Route to the fixture's command handler
4. Build RDM response with matching transaction number
5. Wrap in ART_RDM and send back to the source

### DMX Data

On ART_DMX (opcode 0x5000):
- Extract 512-byte channel data for the configured universe
- Update each fixture's channel values based on its start address and footprint
- Trigger UI refresh

## Supported RDM PIDs

Each fixture responds to these standard PIDs:

| PID | Code | GET | SET | Description |
|-----|------|-----|-----|-------------|
| SUPPORTED_PARAMETERS | 0x0050 | ✓ | | List of supported PIDs |
| DEVICE_INFO | 0x0060 | ✓ | | Core device metadata |
| DEVICE_MODEL_DESCRIPTION | 0x0080 | ✓ | | Model name string |
| MANUFACTURER_LABEL | 0x0081 | ✓ | | Manufacturer name string |
| DEVICE_LABEL | 0x0082 | ✓ | ✓ | User-settable name |
| SOFTWARE_VERSION_LABEL | 0x00C0 | ✓ | | Firmware version string |
| DMX_START_ADDRESS | 0x00F0 | ✓ | ✓ | Channel 1-512 |
| DMX_PERSONALITY | 0x00E0 | ✓ | ✓ | Current personality |
| DMX_PERSONALITY_DESCRIPTION | 0x00E1 | ✓ | | Per-personality details |
| SENSOR_DEFINITION | 0x0200 | ✓ | | Sensor metadata |
| SENSOR_VALUE | 0x0201 | ✓ | | Current sensor readings |
| IDENTIFY_DEVICE | 0x1000 | ✓ | ✓ | Identify mode on/off |
| DEVICE_HOURS | 0x0400 | ✓ | | Simulated run hours |

Unsupported PIDs return NACK with reason `NR_UNKNOWN_PID` (0x0000).

### RDM Packet Format

```
Byte 0:     Start Code (0x01)
Byte 1:     Sub Start Code (0x01)
Byte 2:     Message Length (excl. start code + checksum)
Bytes 3-8:  Destination UID (6 bytes)
Bytes 9-14: Source UID (6 bytes)
Byte 15:    Transaction Number
Byte 16:    Port ID (1)
Byte 17:    Reserved (0)
Bytes 18-19: Subdevice (big-endian)
Byte 20:    Command Class (0x21=GET_RESPONSE, 0x31=SET_RESPONSE)
Bytes 21-22: PID (big-endian)
Byte 23:    Parameter Data Length
Bytes 24+:  Parameter Data
Last 2:     Checksum (sum of all preceding bytes, big-endian)
```

## Fixture Model

### Identity (user-configured)
- `uid`: 6-byte RDM UID — auto-generated with configurable manufacturer prefix, or manual
- `manufacturerId`: 16-bit (reported in DEVICE_INFO)
- `modelId`: 16-bit (reported in DEVICE_INFO)
- `manufacturerLabel`: string (up to 32 chars)
- `modelDescription`: string (up to 32 chars)
- `deviceLabel`: string (up to 32 chars, writable via RDM SET)
- `softwareVersionLabel`: string

### Personalities
Array of `{ index, label, slotCount }`:
- Index is 1-based
- `slotCount` = number of DMX channels used
- Current personality determines the fixture's DMX footprint

### Live State
- `dmxStartAddress`: 1-512 (writable via RDM SET)
- `currentPersonality`: index into personalities (writable via RDM SET)
- `identifyMode`: boolean (writable via RDM SET, triggers UI flash)
- `channelValues[]`: actual DMX levels received from ART_DMX
- `sensorValues[]`: synthetic readings (randomized within range, updated periodically)
- `deviceHours`: incremented while running

### Built-in Fixture Presets

| Preset | Channels | Personalities | Description |
|--------|----------|---------------|-------------|
| Generic RGB | 3 | 1: RGB (3ch) | Basic RGB wash |
| Generic RGBW | 4-8 | 1: RGBW (4ch), 2: RGBW+Dim+Strobe (6ch) | RGBW par |
| Moving Head | 16 | 1: Full (16ch), 2: Basic (8ch) | Pan/Tilt/Color/Gobo/Dimmer |
| LED Par | 7 | 1: Full (7ch), 2: RGB-only (3ch) | RGBWA + Dimmer + Strobe |
| Dimmer | 1 | 1: Single (1ch) | Simple dimmer channel |

## UI Design

### Fixture Card (Canvas-rendered)

```
┌──────────────────────────┐
│  ●  "Front Wash L"   #001│  identify dot + label + DMX address
│ ┌──────────────────────┐ │
│ │                      │ │
│ │    COLOR SWATCH      │ │  filled rectangle = computed RGB
│ │                      │ │
│ └──────────────────────┘ │
│ R  G  B  W  D  S        │  channel labels
│ ██ ██ ██ ██ ▄▄ ░░       │  vertical bars (height ∝ value)
│ 255 200 80 0  180 30    │  numeric values
│                          │
│ Mode: 8-bit RGBW (4ch)  │  current personality
└──────────────────────────┘
```

- **Color swatch**: Blends RGB/RGBW channels into display color. Dimmer-only fixtures show white at dimmer level.
- **Channel bars**: Colored per channel type (R=red, G=green, B=blue, W=white, others=cyan). Height = value/255.
- **Identify animation**: Card border flashes yellow/white when identify mode is ON.
- **Grid layout**: Auto-flow responsive grid. Cards size to fill available space. Scrollable if needed.

### Sidebar (Left, ~280px, collapsible)

**Gateway Section:**
- Gateway name (text input)
- Net (0-127) / Subnet (0-15) / Universe (0-15) dropdowns
- Listen IP (auto-detect toggle or manual entry)
- Start / Stop button (green/red)

**Fixture List:**
- Scrollable list with fixture name + address
- Click to select → shows edit panel
- `[+]` button → opens Add Fixture dialog (pick preset, set address, name)
- Right-click context menu → Delete / Duplicate

**Edit Panel (selected fixture):**
- UID display (read-only or editable)
- DMX Start Address (number input, 1-512)
- Personality dropdown
- Device Label text field
- Manufacturer / Model labels
- Sensor toggle (enable/disable synthetic sensors)

### Packet Log (Bottom, resizable)

- Scrolling list of recent packets (last 200)
- Columns: Timestamp | Direction (→/←) | Type | Summary
- Color-coded: green = response sent, blue = query received, red = error/NAK
- Filter buttons by packet type (POLL, TOD, RDM, DMX)
- Clear button
- Auto-scroll toggle

## Project Location

`D:\HASS\core\config\rdm-simulator` — inside the inner config repo, near the RDM integration.

## Project Structure

```
rdm-simulator/
├── package.json
├── tsconfig.json
├── electron-builder.json
├── src/
│   ├── main/
│   │   ├── main.ts              — Electron entry, window creation
│   │   ├── ipc.ts               — IPC handler registration
│   │   ├── protocol/
│   │   │   ├── artnet-server.ts — UDP socket, packet dispatch
│   │   │   ├── artnet-packets.ts— Art-Net packet builders/parsers
│   │   │   ├── rdm-packets.ts  — RDM packet builders/parsers
│   │   │   └── rdm-handler.ts  — RDM command routing & response
│   │   ├── fixtures/
│   │   │   ├── fixture.ts      — Fixture class (state + RDM logic)
│   │   │   ├── fixture-manager.ts— Collection management
│   │   │   └── presets.ts      — Built-in fixture presets
│   │   └── config-store.ts     — JSON persistence
│   ├── renderer/
│   │   ├── index.html
│   │   ├── renderer.ts         — Entry point
│   │   ├── canvas/
│   │   │   ├── fixture-grid.ts — Grid layout + render loop
│   │   │   └── fixture-card.ts — Single card drawing
│   │   ├── sidebar/
│   │   │   ├── sidebar.ts      — Sidebar container
│   │   │   ├── gateway-panel.ts— Gateway config UI
│   │   │   ├── fixture-list.ts — Fixture list + add/remove
│   │   │   └── edit-panel.ts   — Selected fixture editor
│   │   ├── packet-log/
│   │   │   └── packet-log.ts   — Log panel
│   │   └── styles.css
│   └── shared/
│       ├── types.ts            — Shared interfaces (IFixtureConfig, etc.)
│       └── constants.ts        — PIDs, opcodes, defaults
├── presets/                    — JSON fixture preset files
└── config/                     — User config storage location
```

## Config Persistence

Saved to `~/.rdm-simulator/config.json`:

```json
{
    "gateway": {
        "name": "RDM Simulator",
        "net": 0,
        "subnet": 0,
        "universe": 0,
        "listenIp": "0.0.0.0"
    },
    "fixtures": [
        {
            "uid": "7A70:00000001",
            "preset": "generic-rgbw",
            "dmxStartAddress": 1,
            "currentPersonality": 1,
            "deviceLabel": "Front Wash L",
            "manufacturerId": 31344,
            "modelId": 1,
            "sensors": true
        }
    ]
}
```

## Verification Plan

1. **Protocol verification**: Start the simulator, then run the RDM integration's discovery flow. Verify:
   - Gateway appears in ART_POLL_REPLY
   - Fixtures appear in TOD
   - DEVICE_INFO returns correct data for each fixture
   - All supported PIDs respond correctly
   - SET operations (address, personality, label, identify) persist

2. **UI verification**: Open the Electron app and:
   - Add fixtures from presets
   - See color swatches update when DMX data arrives
   - See channel bars reflect live values
   - See identify animation when triggered from HA
   - Verify packet log shows bidirectional traffic

3. **Integration test**: End-to-end with ConX:
   - Start simulator with multiple fixtures (different types)
   - Open HA, trigger RDM scan
   - Verify all fixtures discovered with correct metadata
   - Change start address from HA → verify simulator updates
   - Send DMX from ConX → verify simulator shows channel values
