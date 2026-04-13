#!/bin/bash
# Sync entire HA Core repo from Windows to WSL2 native filesystem.
# The Docker container mounts from WSL2 to avoid 9P filesystem hangs.
#
# Usage: ./sync-to-wsl.sh
#        ./sync-to-wsl.sh --dry-run

SRC="/mnt/d/HASS/core/"
DST="/home/lior/HASS/core/"
EXTRA="$@"

wsl -d Ubuntu -- bash -c "rsync -a --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='config/custom_components' \
    --exclude='config/home-assistant.log' \
    --exclude='config/home-assistant_v2.db*' \
    --exclude='config/db_dmx.yaml' \
    --exclude='config/db_cues*.yaml' \
    --exclude='config/tmp/' \
    $EXTRA \
    '$SRC' '$DST'"

echo "Synced: D:\\HASS\\core -> WSL2:/home/lior/HASS/core"
