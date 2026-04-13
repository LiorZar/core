# ConX Custom Docker Image — Design Spec

## Context

**Problem:** Clients currently install HA on Raspberry Pi by downloading the official HA image from Docker Hub, then manually copying ConX custom components to the Pi. This is error-prone and makes updates painful.

**Solution:** Build a custom Docker image on Docker Hub that starts from the official HA image and layers ConX components, security overrides, and pre-built frontend on top. Clients pull one image and run — everything works out of the box.

**Long-term:** Eventually contribute integrations directly to HA upstream. This Docker image is the bridge solution.

## Architecture

```
┌─────────────────────────────────────────────┐
│  liorzar/conx:ha2026.3.4-conx1.0.0         │
│                                              │
│  Layer 2: ConX Overlay                       │
│  ┌────────────────────────────────────────┐  │
│  │ /opt/conx/custom_components/           │  │
│  │   conx/  rdm/  scheduler/              │  │
│  │   websocket_api/                       │  │
│  │ /opt/conx/www/                         │  │
│  │   conx.js  conx.css  conx-presets.html │  │
│  │   scheduler-card/  images/  etc.       │  │
│  │ /usr/src/.../homeassistant/core.py     │  │
│  │   (patched — non-admin script block)   │  │
│  │ /etc/s6-overlay/.../conx-init          │  │
│  │   (startup sync script)                │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  Layer 1: Official Home Assistant            │
│  ┌────────────────────────────────────────┐  │
│  │ homeassistant/home-assistant:2026.3.4  │  │
│  │ (unmodified, from Docker Hub)          │  │
│  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Dockerfile.conx

Located at repo root: `D:\HASS\core\Dockerfile.conx`

```dockerfile
ARG HA_VERSION=2026.3.4
FROM homeassistant/home-assistant:${HA_VERSION}

LABEL maintainer="2DLogic"
LABEL description="Home Assistant with ConX lighting control"

ARG CONX_VERSION=1.0.0
LABEL conx.version="${CONX_VERSION}"
LABEL ha.version="${HA_VERSION}"

# --- Core override ---
# Patched core.py: non-admin users cannot execute scripts
COPY config/components/core.py /usr/src/homeassistant/homeassistant/core.py

# --- Custom components (staged for startup copy) ---
COPY config/components/conx           /opt/conx/custom_components/conx
COPY config/components/rdm            /opt/conx/custom_components/rdm
COPY config/components/scheduler      /opt/conx/custom_components/scheduler
COPY config/components/websocket_api  /opt/conx/custom_components/websocket_api

# --- Frontend assets (staged for startup copy) ---
# Copy the entire www/ directory — includes:
#   conx.js, conx.css (hardlinked from conx-ui/scripts/ build output)
#   conx-presets.html (preset/template library, replaces former conxlib.js)
#   style-picker.html, DigitalClock.js, codemirror.min.js
#   scheduler-card/ (scheduler frontend, built from scheduler-card-ui/)
#   images/ (backgrounds, gradients)
#   Branding images
COPY config/www  /opt/conx/www

# --- Startup init script ---
# Copies staged files into /config volume on every container start
COPY docker/conx-init /etc/s6-overlay/s6-rc.d/conx-init
COPY docker/conx-init-run.sh /etc/s6-overlay/s6-rc.d/conx-init/run
RUN chmod +x /etc/s6-overlay/s6-rc.d/conx-init/run
```

> **Note:** The exact S6 overlay integration path depends on which S6 version the HA base image uses. This will be verified during implementation by inspecting the official HA image's `/etc/s6-overlay/` structure.

## Startup Init Script

`docker/conx-init-run.sh`:

```bash
#!/command/with-contenv bashio
# ConX init — sync components and frontend to /config volume

echo "ConX: Syncing custom components..."
mkdir -p /config/custom_components
cp -r /opt/conx/custom_components/* /config/custom_components/

echo "ConX: Syncing frontend assets..."
mkdir -p /config/www
cp -r /opt/conx/www/* /config/www/

echo "ConX: Init complete"
```

**Why copy on startup?** Clients mount `/config` as a Docker volume. Files baked into `/config/` in the image get hidden by the volume mount. The init script runs before HA starts and populates the mounted volume with the latest components from the image.

## Versioning

**Tag format:** `liorzar/conx:ha<HA_VERSION>-conx<CONX_VERSION>`

Examples:
- `liorzar/conx:ha2026.3.4-conx1.0.0`
- `liorzar/conx:ha2026.4.0-conx1.1.0`
- `liorzar/conx:latest` (always points to the newest build)

**When to bump:**
- HA version changes → update `HA_VERSION` arg
- ConX components change → bump `CONX_VERSION`
- Both can change independently

## Build & Publish Workflow

All done locally from `D:\HASS\core`:

```bash
# 1. Build frontends (if changed)
cd config/conx-ui && tsc && cd ../..
# Scheduler card (if changed) — separate git repo, requires npm
cd config/scheduler-card-ui && npm run build && cd ../..

# 2. Build the Docker image
docker build \
  --platform linux/arm64 \
  --build-arg HA_VERSION=2026.3.4 \
  --build-arg CONX_VERSION=1.0.0 \
  -f Dockerfile.conx \
  -t liorzar/conx:ha2026.3.4-conx1.0.0 \
  -t liorzar/conx:latest \
  .

# 3. Push to Docker Hub
docker push liorzar/conx:ha2026.3.4-conx1.0.0
docker push liorzar/conx:latest
```

## Client Deployment

```bash
# Pull the image
docker pull liorzar/conx:ha2026.3.4-conx1.0.0

# Run (first time — HA onboarding flow appears)
docker run -d \
  --name conx \
  -v conx-config:/config \
  -p 8123:8123 \
  --restart unless-stopped \
  liorzar/conx:ha2026.3.4-conx1.0.0

# Update to a new version
docker pull liorzar/conx:ha2026.4.0-conx1.1.0
docker stop conx && docker rm conx
docker run -d \
  --name conx \
  -v conx-config:/config \
  -p 8123:8123 \
  --restart unless-stopped \
  liorzar/conx:ha2026.4.0-conx1.1.0
```

Client config data persists in the `conx-config` named volume across updates.

## What Goes Where

| Source (in repo) | Destination (in image) | When applied |
|---|---|---|
| `config/components/core.py` | `/usr/src/homeassistant/homeassistant/core.py` | Build time (replaces HA's core.py) |
| `config/components/conx/` | `/opt/conx/custom_components/conx/` → `/config/custom_components/conx/` | Build + startup copy |
| `config/components/rdm/` | `/opt/conx/custom_components/rdm/` → `/config/custom_components/rdm/` | Build + startup copy |
| `config/components/scheduler/` | `/opt/conx/custom_components/scheduler/` → `/config/custom_components/scheduler/` | Build + startup copy |
| `config/components/websocket_api/` | `/opt/conx/custom_components/websocket_api/` → `/config/custom_components/websocket_api/` | Build + startup copy |
| `config/www/` (entire directory) | `/opt/conx/www/` → `/config/www/` | Build + startup copy |

**`config/www/` contents (all included):**
- `conx.js` + `conx.js.map` — main frontend bundle (built from `conx-ui/`, hardlinked)
- `conx.css` — styles (hardlinked from `conx-ui/scripts/`)
- `conx-presets.html` — preset/template library (standalone, replaces former `conxlib.js`)
- `style-picker.html` — style picker tool (standalone)
- `DigitalClock.js` — clock widget
- `codemirror.min.js` — CodeMirror editor for YAML/config editing in UI
- `scheduler-card/` — scheduler frontend (built from `scheduler-card-ui/`)
- `images/` — background/gradient images used by UI
- Branding images (`danor.jpg`, `likis.jpeg`, `logo.jpeg`)

## New Files to Create

| File | Purpose |
|---|---|
| `Dockerfile.conx` | The production ConX Docker build file |
| `docker/conx-init/type` | S6 service type declaration (oneshot) |
| `docker/conx-init/up` | S6 oneshot "up" command |
| `docker/conx-init-run.sh` | The actual init script |
| `.dockerignore.conx` | Exclude unnecessary files from build context |

## .dockerignore.conx

```
.git
.github
.devcontainer
.vscode
tests/
script/
docs/
*.md
__pycache__
.mypy_cache
.ruff_cache
```

## Platform

- **Target:** `linux/arm64` (Raspberry Pi)
- **Base image:** `homeassistant/home-assistant:2026.3.4` (official, from Docker Hub)
- **Registry:** Docker Hub (`liorzar/conx`)

## Security (Current)

The image includes these security features from the existing codebase:
1. **core.py override** — Non-admin users cannot execute scripts (raises ServiceNotFound)
2. **websocket_api override** — Non-admin entity filtering (hides automation.*/script.* unless in allowed_users), decorator-based authorization, user connection tracking

Future security hardening will be addressed in a separate design.

## Verification

1. Build the image locally
2. Run it with a fresh named volume
3. Verify HA onboarding flow appears at localhost:8123
4. Check that custom_components were copied: `docker exec conx ls /config/custom_components/`
5. Check that frontend assets were copied: `docker exec conx ls /config/www/`
6. Verify core.py override: `docker exec conx head -5 /usr/src/homeassistant/homeassistant/core.py`
7. Configure a conx light entity and verify it works through the UI
8. Pull a new version and confirm components update in the existing config volume
