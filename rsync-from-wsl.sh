#!/bin/bash
# Reverse sync: WSL2 -> Windows (entire repo).
# Pulls runtime changes back to Windows.
#
# Usage: ./rsync-from-wsl.sh

SRC="/home/lior/HASS/core/"
DST="/mnt/d/HASS/core/"

wsl -d Ubuntu -- bash -c "rsync -a --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='__pycache__' \
    --exclude='*.pyc' \
    --exclude='config/custom_components' \
    --exclude='config/home-assistant_v2.db*' \
    --exclude='config/tmp/' \
    '$SRC' '$DST'"

echo "Synced: WSL2:/home/lior/HASS/core -> D:\\HASS\\core"
