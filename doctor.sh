#!/usr/bin/env bash
# Wrapper to run the Planet One & AMZX Network Doctor
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$SCRIPT_DIR/planetone-explorer/scripts/doctor.sh" ]; then
    exec bash "$SCRIPT_DIR/planetone-explorer/scripts/doctor.sh" "$@"
elif [ -f "$HOME/planetone-explorer/scripts/doctor.sh" ]; then
    exec bash "$HOME/planetone-explorer/scripts/doctor.sh" "$@"
else
    echo "Doctor script not found in standard paths."
    exit 1
fi
