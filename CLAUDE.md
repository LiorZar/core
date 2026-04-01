# ConX Project

## Important: Two Repos, One Workspace

This workspace contains **two git repos**:

1. **Outer repo** (`D:\HASS\core`) — a fork of [Home Assistant Core](https://github.com/home-assistant/core).
   We do **NOT** develop in this repo. It exists only to provide the HA runtime.
   Minimal changes are made here (Dockerfile, devcontainer, gitignore).

2. **Inner repo** (`D:\HASS\core\config`) — our actual project repo (`LiorZar/conx.git`).
   **All development happens here.** This is the HA `config/` directory containing
   custom components, frontend assets, device configs, and YAML databases.

> **Rule:** Never modify files outside `config/` unless explicitly asked.
> The outer repo is only rebased/upgraded to track new HA releases.

## Docker & Development Workflow

- The project runs inside a Docker devcontainer. **Claude handles all Docker operations** —
  building, starting, restarting, exec-ing commands, etc. The user should never need to
  deal with Docker directly.
- The local `D:\HASS\core` directory is volume-mounted into the container, so editing
  files locally (outside the container) automatically updates them inside the container.
  There is no need to copy files in.
- **Always prefer making changes inside our own folders** (`config/`, `components/`).
  Avoid touching HA core files or other outer-repo files unless absolutely necessary.

## Home Assistant Version

| Field | Value |
|-------|-------|
| HA Version | **2025.9.4** |
| Docker image | `liorzar/conx:2025.01.1` |
| Platform | `linux/arm64` (aarch64) |

**Claude handles HA version upgrades** when asked. The upgrade workflow:

1. **Sync the fork from upstream:**
   - `git fetch upstream` — get latest from `home-assistant/core`
   - Merge or rebase the desired release/tag into the local `dev` branch
   - Push to `origin` (`LiorZar/core.git`) to keep the fork up to date
2. **Update locally:**
   - Pull the updated fork into the local working copy
   - Update the version in `homeassistant/const.py` (`MAJOR_VERSION`, `MINOR_VERSION`, `PATCH_VERSION`)
   - Rebuild the Docker image if needed

Git remotes:
- `origin` → `https://github.com/LiorZar/core.git` (our fork)
- `upstream` → `https://github.com/home-assistant/core.git` (official HA)

## How HA Component Overrides Work

Home Assistant loads components from `custom_components/` **before** built-in ones.
If a component in `custom_components/` has the same `domain` as a built-in component,
it **completely replaces** the built-in version.

In our project:
- `components/` is the **git-tracked** source of truth (checked into the config repo).
- `custom_components/` is a **runtime copy** (gitignored) — created by `copy.bat` or
  the devcontainer setup. They are identical.
- Always edit files in `components/`, never in `custom_components/`.

## Project Structure (config/ repo)

See [config/CLAUDE.md](config/CLAUDE.md) for full details on the inner repo, including:
- [components/conx/CLAUDE.md](config/components/conx/CLAUDE.md) — main custom integration
- [components/websocket_api/CLAUDE.md](config/components/websocket_api/CLAUDE.md) — websocket_api override
- [conx/CLAUDE.md](config/conx/CLAUDE.md) — device & platform YAML configs
- [www/CLAUDE.md](config/www/CLAUDE.md) — frontend web assets