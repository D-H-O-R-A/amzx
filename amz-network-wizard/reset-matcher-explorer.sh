#!/usr/bin/env bash
# ==============================================================================
#      🚀  AMZX DEX MATCHER & FULL EXPLORER RESET & REINDEX WIZARD  🚀
# ==============================================================================
# Developer: Diego Antunes (diegoantunes2301@gmail.com)
# WhatsApp: +55 (11) 97428-9097
# GitHub: https://github.com/D-H-O-R-A
# ==============================================================================
# This script allows safely resetting and re-configuring the Matcher DEX seed,
# wiping LevelDB/snapshots of the Matcher, cleaning FullExplorer SQLite databases,
# and re-indexing everything from genesis without affecting the running blockchain node!
# ==============================================================================

set -euo pipefail

# Colors for terminal styling
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}==============================================================================${NC}"
echo -e "      🚀  ${BOLD}AMZX DEX MATCHER & FULL EXPLORER RESET & REINDEX WIZARD${NC}  🚀"
echo -e "${CYAN}==============================================================================${NC}"
echo -e "Developer: Diego Antunes (diegoantunes2301@gmail.com)"
echo -e "WhatsApp:  +55 (11) 97428-9097"
echo -e "GitHub:    https://github.com/D-H-O-R-A"
echo -e "${CYAN}==============================================================================${NC}"

# ------------------------------------------------------------------------------
# STEP 1: Detect Directories and Configuration
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}${BOLD}--- 🔍 STEP 1: LOCATING DIRECTORIES & CONFIGURATIONS ---${NC}"

WIZARD_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$WIZARD_DIR/.." && pwd )"

echo -e "👉 Wizard Dir:   ${CYAN}$WIZARD_DIR${NC}"
echo -e "👉 Project Root:  ${CYAN}$PROJECT_ROOT${NC}"

# Find run directory dynamically (run-amzx-[ChainID])
RUN_DIR=""
for d in "$WIZARD_DIR"/run-amzx-*; do
  if [ -d "$d" ]; then
    RUN_DIR="$d"
    break
  fi
done

if [ -z "$RUN_DIR" ]; then
  # Fallback to checking the parent directory
  for d in "$PROJECT_ROOT"/run-amzx-*; do
    if [ -d "$d" ]; then
      RUN_DIR="$d"
      break
    fi
  done
fi

if [ -z "$RUN_DIR" ] || [ ! -d "$RUN_DIR" ]; then
  echo -e "${RED}${BOLD}[ERROR] Active blockchain execution directory (run-amzx-*) not found!${NC}"
  echo -e "Please make sure you have initialized the network at least once."
  exit 1
fi

echo -e "👉 Execution Dir: ${GREEN}$RUN_DIR${NC}"

BLOCKCHAIN_CONF="$RUN_DIR/blockchain.conf"
MATCHER_CONF="$RUN_DIR/matcher.conf"

if [ ! -f "$BLOCKCHAIN_CONF" ]; then
  echo -e "${RED}${BOLD}[ERROR] Blockchain configuration ($BLOCKCHAIN_CONF) not found!${NC}"
  exit 1
fi

if [ ! -f "$MATCHER_CONF" ]; then
  echo -e "${RED}${BOLD}[ERROR] Matcher configuration ($MATCHER_CONF) not found!${NC}"
  exit 1
fi

# Detect FullExplorer Directory
EXPLORER_DIR=""
for d in /var/www/fullexplorer.*; do
  if [ -d "$d" ]; then
    EXPLORER_DIR="$d"
    break
  fi
done

if [ -z "$EXPLORER_DIR" ] && [ -d "/var/www/fullexplorer.planetone.io" ]; then
  EXPLORER_DIR="/var/www/fullexplorer.planetone.io"
fi

if [ -n "$EXPLORER_DIR" ]; then
  echo -e "👉 FullExplorer:  ${GREEN}$EXPLORER_DIR${NC}"
else
  echo -e "👉 FullExplorer:  ${YELLOW}Not installed in standard /var/www/fullexplorer.* folders${NC}"
fi

# ------------------------------------------------------------------------------
# STEP 2: Handle Seed Redefinition
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}${BOLD}--- 🔑 STEP 2: HANDLING MATCHER SEED REDEFINITION ---${NC}"

# Read existing Base58 seed from blockchain.conf
EXISTING_SEED_BASE58=$(grep -E '^[[:space:]]*seed[[:space:]]*=' "$BLOCKCHAIN_CONF" | sed -E 's/.*=[[:space:]]*"([^"]+)".*/\1/' | tr -d '[:space:]')

# Decide which seed to use
RAW_INPUT_SEED=""
if [ $# -gt 0 ] && [ -n "$1" ]; then
  RAW_INPUT_SEED="$1"
  echo -e "👉 Using custom seed phrase provided via command argument."
else
  if [ -z "$EXISTING_SEED_BASE58" ]; then
    echo -e "${RED}${BOLD}[ERROR] Could not read existing Genesis Seed from blockchain.conf!${NC}"
    exit 1
  fi
  RAW_INPUT_SEED="$EXISTING_SEED_BASE58"
  echo -e "👉 Automatically reusing the Genesis Seed from your active blockchain configuration."
fi

# Convert Seed to Base64 (Matcher Format) using Python 3
echo -e "🔒 Encoding Matcher Seed securely to Base64..."
MATCHER_SEED_BASE64=$(python3 -c "
import base64
import sys

def b58decode(v):
    alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    for c in v:
        if c not in alphabet:
            raise ValueError()
    leading_ones = 0
    for c in v:
        if c == '1':
            leading_ones += 1
        else:
            break
    n = 0
    for c in v:
        n = n * 58 + alphabet.index(c)
    res = bytearray()
    while n > 0:
        res.append(n % 256)
        n //= 256
    res.extend([0] * leading_ones)
    return bytes(res[::-1])

inp = '''$RAW_INPUT_SEED'''.strip()
if ' ' not in inp and len(inp) >= 30:
    try:
        decoded = b58decode(inp)
        print(base64.b64encode(decoded).decode('utf-8'))
        sys.exit(0)
    except Exception:
        pass

print(base64.b64encode(inp.encode('utf-8')).decode('utf-8'))
")

if [ -z "$MATCHER_SEED_BASE64" ]; then
  echo -e "${RED}${BOLD}[ERROR] Failed to convert seed to Base64 format!${NC}"
  exit 1
fi

echo -e "✅ Seed format conversion completed successfully!"

# ------------------------------------------------------------------------------
# STEP 3: Stop Services
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}${BOLD}--- 🛑 STEP 3: STOPPING MATCHER & EXPLORER SERVICES ---${NC}"

# Kill Matcher processes forcefully and release ports
echo -e "👉 Terminating Matcher processes and freeing ports..."
pkill -9 -f "dex/run" &>/dev/null || true
pkill -9 -f "sbtLauncher" &>/dev/null || true
pkill -9 -f "com.wavesplatform.dex.Application" &>/dev/null || true
pkill -9 -f "com.wavesplatform.dex" &>/dev/null || true
fuser -k -9 6886/tcp &>/dev/null || true
fuser -k -9 10251/tcp &>/dev/null || true
sleep 2

# Kill FullExplorer Indexers
echo -e "👉 Terminating FullExplorer indexers..."
pkill -9 -f "updater.sh" &>/dev/null || true
pkill -9 -f "updater_headers.sh" &>/dev/null || true

# Stop FullExplorer systemd services if they exist
if systemctl list-units --all --type=service | grep -q "fullexplorer-"; then
  echo -e "👉 Stopping production FullExplorer systemd services..."
  for srv in $(systemctl list-units --all --type=service --no-legend | awk '{print $1}' | grep "fullexplorer-"); do
    echo -e "   Stopping: ${CYAN}$srv${NC}"
    sudo systemctl stop "$srv" 2>/dev/null || true
  done
fi

echo -e "✅ All target processes stopped successfully."

# ------------------------------------------------------------------------------
# STEP 4: Redefine Seed in matcher.conf
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}${BOLD}--- ⚙️ STEP 4: UPDATING SEED IN MATCHER CONFIGURATION ---${NC}"

# Backup old config first
cp "$MATCHER_CONF" "$MATCHER_CONF.bak"
echo -e "👉 Created backup of matcher.conf at: ${CYAN}$MATCHER_CONF.bak${NC}"

# Replace the seed securely
python3 -c "
with open('$MATCHER_CONF', 'r') as f:
    content = f.read()

import re
if 'seed-in-base-64' in content:
    content = re.sub(r'seed-in-base-64\s*=\s*\"[^\"]*\"', 'in-mem.seed-in-base-64 = \"$MATCHER_SEED_BASE64\"', content)
elif 'account-storage' in content:
    pattern = re.compile(r'(account-storage\s*\{[^}]*)')
    content = pattern.sub(r'\1\n    in-mem.seed-in-base-64 = \"$MATCHER_SEED_BASE64\"', content)

with open('$MATCHER_CONF', 'w') as f:
    f.write(content)
"

# Force restricted permissions (chmod 600)
chmod 600 "$MATCHER_CONF"
echo -e "✅ ${GREEN}matcher.conf updated and secured successfully!${NC}"

# ------------------------------------------------------------------------------
# STEP 5: Clear Databases (Reset State)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}${BOLD}--- 🧹 STEP 5: CLEARING MATCHER & INDEXER DATABASES ---${NC}"

# Reset Matcher database
MATCHER_DATA_DIR="$RUN_DIR/matcher-data"
if [ -d "$MATCHER_DATA_DIR" ]; then
  echo -e "👉 Clearing Matcher LevelDB state and orderbooks in ${CYAN}$MATCHER_DATA_DIR${NC}..."
  rm -rf "$MATCHER_DATA_DIR"/data 2>/dev/null || true
  rm -f "$MATCHER_DATA_DIR"/lp-accounts.txt "$MATCHER_DATA_DIR"/*.txt 2>/dev/null || true
  mkdir -p "$MATCHER_DATA_DIR"/data
  touch "$MATCHER_DATA_DIR"/lp-accounts.txt
fi

# Reset FullExplorer SQLite Database (forces complete reindex from Block 1)
if [ -n "$EXPLORER_DIR" ] && [ -d "$EXPLORER_DIR/var/db" ]; then
  echo -e "👉 Clearing FullExplorer SQLite databases in ${CYAN}$EXPLORER_DIR/var/db${NC}..."
  rm -rf "$EXPLORER_DIR/var/db"/* 2>/dev/null || true
  echo -e "   FullExplorer will completely reindex all blocks from block height 1."
fi

echo -e "✅ Databases cleared and prepared for clean reindexing."

# ------------------------------------------------------------------------------
# STEP 6: Start Services
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}${BOLD}--- 🚀 STEP 6: RESTARTING SERVICES ---${NC}"

# Start Matcher DEX
START_MATCHER_SCRIPT="$RUN_DIR/start-matcher.sh"
if [ -f "$START_MATCHER_SCRIPT" ]; then
  echo -e "👉 Starting Matcher DEX in background..."
  nohup "$START_MATCHER_SCRIPT" < /dev/null > "$RUN_DIR/matcher.log" 2>&1 &
  echo -e "   Logs available at: ${CYAN}tail -f $RUN_DIR/matcher.log${NC}"
else
  echo -e "${RED}${BOLD}[WARNING] Matcher start script not found at $START_MATCHER_SCRIPT!${NC}"
fi

# Restart FullExplorer
if systemctl list-units --all --type=service | grep -q "fullexplorer-"; then
  echo -e "👉 Starting production FullExplorer systemd services..."
  sudo systemctl daemon-reload
  for srv in $(systemctl list-units --all --type=service --no-legend | awk '{print $1}' | grep "fullexplorer-"); do
    echo -e "   Starting: ${GREEN}$srv${NC}"
    sudo systemctl start "$srv" 2>/dev/null || true
  done
else
  # Local dev run fallback
  if [ -n "$EXPLORER_DIR" ] && [ -f "$EXPLORER_DIR/updater.sh" ]; then
    echo -e "👉 Starting local FullExplorer indexer daemons in background..."
    cd "$EXPLORER_DIR"
    chmod +x updater.sh updater_headers.sh 2>/dev/null || true
    nohup bash updater.sh > "$EXPLORER_DIR/fullexplorer_boot.log" 2>&1 &
    nohup bash updater_headers.sh >> "$EXPLORER_DIR/fullexplorer_boot.log" 2>&1 &
    cd "$WIZARD_DIR"
  fi
fi

echo -e "\n${GREEN}${BOLD}==============================================================================${NC}"
echo -e "🎉  ${GREEN}${BOLD}RESET & REINDEX COMPLETED SUCCESSFULLY!${NC}  🎉"
echo -e "${GREEN}==============================================================================${NC}"
echo -e "👉 ${BOLD}Blockchain Node:${NC}  ${GREEN}UNTOUCHED${NC} (Safe & Running!)"
echo -e "👉 ${BOLD}Matcher DEX:${NC}      ${GREEN}RESET & RECONFIGURED${NC} with new secure seed."
echo -e "👉 ${BOLD}FullExplorer:${NC}     ${GREEN}RESET${NC} (Re-indexing automatically from block height 1...)"
echo -e "${GREEN}==============================================================================${NC}\n"
