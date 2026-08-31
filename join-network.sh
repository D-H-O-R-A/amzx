#!/usr/bin/env bash
# Wrapper to run the AMZX Node & Validator Onboarding Wizard
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$SCRIPT_DIR/amz-network-wizard/join-network.sh" ]; then
    exec bash "$SCRIPT_DIR/amz-network-wizard/join-network.sh" "$@"
else
    echo "join-network.sh not found in amz-network-wizard."
    exit 1
fi
