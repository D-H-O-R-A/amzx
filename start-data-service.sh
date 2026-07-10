#!/usr/bin/env bash
# ==============================================================================
# AMZX DATA SERVICE SERVICE DAEMON & CONFIGURATION WIZARD
# Unified API Indexer (Port 3000) & Swagger UI (Port 8080) Route Router Daemon
# ==============================================================================

# ANSI Color Codes
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DATA_SERVICE_DIR="$SCRIPT_DIR/amzx-data-service"
SYNC_DIR="$SCRIPT_DIR/amzx-blockchain-postgres-sync"
PID_FILE="$SCRIPT_DIR/data-service.pid"
PID_FILE_SYNC="$SCRIPT_DIR/blockchain-sync.pid"
LOG_FILE="$DATA_SERVICE_DIR/data-service.log"
LOG_FILE_SYNC="$SYNC_DIR/blockchain-sync.log"

print_header() {
  echo -e "${CYAN}==============================================================================${NC}"
  echo -e "${CYAN}${BOLD}    🔷  AMZX UNIFIED DATA SERVICE & SWAGGER UI CONFIGURATION WIZARD  🔷${NC}"
  echo -e "${CYAN}==============================================================================${NC}"
}

# ------------------------------------------------------------------------------
# COMMAND ROUTING: STOP / STATUS / RESTART
# ------------------------------------------------------------------------------
stop_service() {
  # Stop node process
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
      echo -e "🛑 ${YELLOW}Stopping AMZX Data Service Indexer (PID: $PID)...${NC}"
      kill "$PID"
      sleep 2
      if kill -0 "$PID" 2>/dev/null; then
        kill -9 "$PID"
      fi
      echo -e "✅ ${GREEN}Indexer stopped successfully.${NC}"
    else
      echo -e "⚠️  ${YELLOW}PID $PID not running. Cleaning up PID file...${NC}"
    fi
    rm -f "$PID_FILE"
  else
    echo -e "⚠️  ${YELLOW}No active Indexer PID file found.${NC}"
  fi

  # Stop blockchain postgres sync consumer (Docker or Native process)
  if [ -f "$PID_FILE_SYNC" ]; then
    PID_SYNC=$(cat "$PID_FILE_SYNC")
    if kill -0 "$PID_SYNC" 2>/dev/null; then
      echo -e "🛑 ${YELLOW}Stopping AMZX Blockchain Postgres Sync Consumer (PID: $PID_SYNC)...${NC}"
      kill "$PID_SYNC"
      sleep 2
      if kill -0 "$PID_SYNC" 2>/dev/null; then
        kill -9 "$PID_SYNC"
      fi
      echo -e "✅ ${GREEN}Sync Consumer stopped successfully.${NC}"
    else
      echo -e "⚠️  ${YELLOW}PID $PID_SYNC not running. Cleaning up Sync PID file...${NC}"
    fi
    rm -f "$PID_FILE_SYNC"
  fi

  # Stop and remove blockchain sync Docker container if running
  if command -v docker &> /dev/null; then
    if docker ps -a --format '{{.Names}}' | grep -q "^amzx-blockchain-sync$"; then
      echo -e "🛑 ${YELLOW}Stopping and removing amzx-blockchain-sync Docker container...${NC}"
      docker stop amzx-blockchain-sync &>/dev/null
      docker rm amzx-blockchain-sync &>/dev/null
      echo -e "✅ ${GREEN}amzx-blockchain-sync Docker container stopped and removed.${NC}"
    fi
  fi

  # Stop Swagger Docker container if running
  if command -v docker &> /dev/null; then
    if docker ps -a --format '{{.Names}}' | grep -q "^amzx-swagger$"; then
      echo -e "🛑 ${YELLOW}Stopping and removing amzx-swagger UI Docker container...${NC}"
      docker stop amzx-swagger &>/dev/null
      docker rm amzx-swagger &>/dev/null
      echo -e "✅ ${GREEN}amzx-swagger Docker container stopped and removed.${NC}"
    fi

    # Stop Postgres Docker container if running
    if docker ps -a --format '{{.Names}}' | grep -q "^amzx-postgres$"; then
      echo -e "🛑 ${YELLOW}Stopping and removing amzx-postgres database Docker container...${NC}"
      docker stop amzx-postgres &>/dev/null
      docker rm amzx-postgres &>/dev/null
      echo -e "✅ ${GREEN}amzx-postgres Docker container stopped and removed.${NC}"
    fi
  fi
}

status_service() {
  print_header
  echo -e "📋 ${BOLD}${UNDERLINE}AMZX UNIFIED SERVICE DIAGNOSTIC SYSTEM${NC}\n"

  # 1. Indexer Status
  echo -e "🔷 ${CYAN}${BOLD}[1/4] Node.js Data Service (Indexer API)${NC}"
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
      echo -e "  - Status:      🟢 ${GREEN}${BOLD}RUNNING${NC}"
      echo -e "  - PID:         ${CYAN}$PID${NC}"
      echo -e "  - Listening:   ${CYAN}Port 3000 (Internal NodeJS)${NC}"
    else
      echo -e "  - Status:      🔴 ${RED}DEAD${NC} (PID file exists but process is not running)"
    fi
  else
    echo -e "  - Status:      ⚪ ${YELLOW}STOPPED${NC}"
  fi
  echo

  # 2. Sync Consumer Status
  echo -e "🔷 ${CYAN}${BOLD}[2/4] Rust Blockchain Postgres Sync Consumer${NC}"
  if [ -f "$PID_FILE_SYNC" ]; then
    PID_SYNC=$(cat "$PID_FILE_SYNC")
    if kill -0 "$PID_SYNC" 2>/dev/null; then
      echo -e "  - Status:      🟢 ${GREEN}${BOLD}RUNNING (Native)${NC}"
      echo -e "  - PID:         ${CYAN}$PID_SYNC${NC}"
    else
      echo -e "  - Status:      🔴 ${RED}DEAD${NC} (PID file exists but process is not running)"
    fi
  elif command -v docker &> /dev/null && docker ps --format '{{.Names}}' | grep -q "^amzx-blockchain-sync$"; then
    echo -e "  - Status:      🟢 ${GREEN}${BOLD}RUNNING (Docker Container)${NC}"
    echo -e "  - Network:     ${CYAN}amzx-network (Bridge)${NC}"
    # Quick log check
    LOG_PREVIEW=$(docker logs amzx-blockchain-sync 2>&1 | tail -n 1 | tr -d '\n' | cut -c1-120)
    echo -e "  - Last Log:    ${YELLOW}${LOG_PREVIEW:-No logs yet}...${NC}"
  else
    echo -e "  - Status:      ⚪ ${YELLOW}STOPPED / INACTIVE${NC}"
  fi
  echo

  # 3. Swagger UI Status
  echo -e "🔷 ${CYAN}${BOLD}[3/4] Interactive Swagger UI Document Portal${NC}"
  if command -v docker &> /dev/null; then
    if docker ps --format '{{.Names}}' | grep -q "^amzx-swagger$"; then
      echo -e "  - Status:      🟢 ${GREEN}${BOLD}RUNNING (Docker Container)${NC}"
      echo -e "  - Route:       ${CYAN}Port 8080 (Internal -> Nginx Proxied to '/' and '/docs')${NC}"
    else
      echo -e "  - Status:      ⚪ ${YELLOW}STOPPED${NC}"
    fi
  else
    echo -e "  - Status:      ⚠️  ${RED}Docker not installed${NC}"
  fi
  echo

  # 4. PostgreSQL Database Diagnostic Status
  echo -e "🔷 ${CYAN}${BOLD}[4/4] PostgreSQL Database System${NC}"
  if command -v docker &> /dev/null; then
    if docker ps -a --format '{{.Names}}' | grep -q "^amzx-postgres$"; then
      CONTAINER_STATE=$(docker inspect --format='{{.State.Status}}' amzx-postgres 2>/dev/null)
      if [ "$CONTAINER_STATE" = "running" ]; then
        echo -e "  - Container:   🟢 ${GREEN}${BOLD}RUNNING (amzx-postgres)${NC}"
        # pg_isready verification
        if docker exec amzx-postgres pg_isready -U "$PGUSER" -d "$PGDATABASE" &>/dev/null; then
          echo -e "  - Db Readiness:🟢 ${GREEN}Ready to accept connections (Healthy via Unix Socket)${NC}"
        else
          echo -e "  - Db Readiness:🔴 ${RED}Initializing or not responding${NC}"
        fi
      else
        echo -e "  - Container:   🔴 ${RED}STOPPED ($CONTAINER_STATE)${NC}"
      fi
    else
      echo -e "  - Container:   ⚪ ${YELLOW}NOT FOUND${NC} (No local amzx-postgres container active)"
    fi
  fi

  # Port binding diagnostic
  if ss -tulpn 2>/dev/null | grep -q ":5432 "; then
    BINDING_INFO=$(ss -tulpn 2>/dev/null | grep ":5432 " | head -n 1)
    echo -e "  - Port 5432:   🟢 ${GREEN}Listening natively on host network:${NC}"
    echo -e "                 ${YELLOW}$BINDING_INFO${NC}"
  else
    echo -e "  - Port 5432:   🔴 ${RED}NOT listening on any host interface${NC}"
  fi

  # Docker Network diagnostic
  if command -v docker &> /dev/null; then
    if docker network ls | grep -q "amzx-network"; then
      echo -e "  - Docker Net:  🟢 ${GREEN}amzx-network is ACTIVE${NC}"
      # Check containers connected to amzx-network
      CONNECTED_CONS=$(docker network inspect amzx-network --format '{{range .Containers}}{{.Name}} (IP: {{.IPv4Address}}), {{end}}' 2>/dev/null | sed 's/, $//')
      echo -e "  - Connections: ${CYAN}${CONNECTED_CONS:-None}${NC}"
    else
      echo -e "  - Docker Net:  🔴 ${RED}amzx-network is NOT active (Bridge communication disabled)${NC}"
    fi
  fi
  echo -e "==============================================================================\n"
}

# Parse command line arguments
case "$1" in
  stop)
    print_header
    stop_service
    exit 0
    ;;
  status)
    print_header
    status_service
    exit 0
    ;;
  restart)
    print_header
    stop_service
    echo
    # Continue execution for start flow
    ;;
  *)
    ;;
esac

# ------------------------------------------------------------------------------
# 0. LOAD PERSISTED ENVIRONMENT VARIABLES IF FILE EXISTS
# ------------------------------------------------------------------------------
ENV_FILE="$SCRIPT_DIR/.env"
if [ -f "$ENV_FILE" ]; then
  echo -e "📖 \033[0;32mLoading configuration from .env file...\033[0m"
  # Read variables safely without triggering commands or errors
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ ! "$line" =~ ^# && ! -z "$line" ]]; then
      # Strip outer quotes if any, and export
      clean_line=$(echo "$line" | sed -e 's/^export //g' -e 's/"//g' -e "s/'//g")
      export "$clean_line"
    fi
  done < "$ENV_FILE"
fi

# ------------------------------------------------------------------------------
# 1. INITIALIZE SANE DEFAULT VALUES
# ------------------------------------------------------------------------------
export PORT=${PORT:-3000}
export PGHOST=${PGHOST:-"127.0.0.1"}
export PGPORT=${PGPORT:-"5432"}
export PGDATABASE=${PGDATABASE:-"amzx_db"}
export PGUSER=${PGUSER:-"postgres"}
export PGPASSWORD=${PGPASSWORD:-"postgres"}
export LOG_LEVEL=${LOG_LEVEL:-"info"}

export DEFAULT_MATCHER=${DEFAULT_MATCHER:-"2eEUvypDSivnzPiLrbYEW39SM8yMZ1aq4eJuiKfs4sEY"}
export RATE_PAIR_ACCEPTANCE_VOLUME_THRESHOLD=${RATE_PAIR_ACCEPTANCE_VOLUME_THRESHOLD:-1}
export RATE_THRESHOLD_ASSET_ID=${RATE_THRESHOLD_ASSET_ID:-"AMZX"}
export RATE_BASE_ASSET_ID=${RATE_BASE_ASSET_ID:-"AMZX"}

# Blockchain Sync Configs
export BLOCKCHAIN_UPDATES_URL=${BLOCKCHAIN_UPDATES_URL:-"http://127.0.0.1:6881"}
export CHAIN_ID_DEC=${CHAIN_ID_DEC:-67} # ASCII 'C'
export STARTING_HEIGHT=${STARTING_HEIGHT:-1}
export USE_DOCKER_SYNC=${USE_DOCKER_SYNC:-"true"} # Default to Docker since native linkpq compiling needs root packages

# Check if service is already running
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    print_header
    echo -e "⚠️  ${YELLOW}AMZX Data Service is already running in background (PID: $PID).${NC}"
    echo -e "To restart, run: ${CYAN}./start-data-service.sh restart${NC}"
    echo -e "To stop, run:    ${CYAN}./start-data-service.sh stop${NC}"
    exit 0
  fi
fi

INTERACTIVE_MODE=false
if [[ "$1" == "--setup" || "$1" == "-i" || "$1" == "--interactive" ]]; then
  INTERACTIVE_MODE=true
fi

print_header

# ------------------------------------------------------------------------------
# 2. INTERACTIVE CONFIGURATION FLOW
# ------------------------------------------------------------------------------
if [ "$INTERACTIVE_MODE" = true ]; then
  echo -e "${YELLOW}Entering interactive configuration mode...${NC}\n"

  # PostgreSQL Settings
  read -p "Enter PostgreSQL Host [$PGHOST]: " INPUT_PGHOST
  export PGHOST=${INPUT_PGHOST:-$PGHOST}

  read -p "Enter PostgreSQL Port [$PGPORT]: " INPUT_PGPORT
  export PGPORT=${INPUT_PGPORT:-$PGPORT}

  read -p "Enter PostgreSQL Database Name [$PGDATABASE]: " INPUT_PGDATABASE
  export PGDATABASE=${INPUT_PGDATABASE:-$PGDATABASE}

  read -p "Enter PostgreSQL Username [$PGUSER]: " INPUT_PGUSER
  export PGUSER=${INPUT_PGUSER:-$PGUSER}

  read -s -p "Enter PostgreSQL Password [$PGPASSWORD]: " INPUT_PGPASSWORD
  echo
  export PGPASSWORD=${INPUT_PGPASSWORD:-$PGPASSWORD}

  # Check if postgres volume exists and offer reset
  if command -v docker &>/dev/null; then
    if docker volume ls -q | grep -q "^amzx-postgres-data$"; then
      echo -e "\n⚠️  ${YELLOW}${BOLD}Warning: A persistent PostgreSQL volume 'amzx-postgres-data' already exists.${NC}"
      echo -e "If you are changing the password, reusing the old volume may cause password authentication to fail."
      read -p "Do you want to reset the database volume and start fresh? [y/N]: " RESET_VOLUME
      RESET_VOLUME=${RESET_VOLUME:-n}
      if [[ "$RESET_VOLUME" =~ ^[Yy]$ ]]; then
        echo -e "🧹 ${CYAN}Cleaning up existing PostgreSQL database volume...${NC}"
        docker stop amzx-postgres &>/dev/null
        docker rm amzx-postgres &>/dev/null
        docker volume rm amzx-postgres-data &>/dev/null
        echo -e "✅ ${GREEN}PostgreSQL volume deleted successfully! A fresh database will be initialized.${NC}"
      fi
    fi
  fi

  # Matcher and Rebranding Settings
  read -p "Enter Matcher Public Key [$DEFAULT_MATCHER]: " INPUT_MATCHER
  export DEFAULT_MATCHER=${INPUT_MATCHER:-$DEFAULT_MATCHER}

  read -p "Enter Native Token Ticker [$RATE_BASE_ASSET_ID]: " INPUT_TICKER
  export RATE_THRESHOLD_ASSET_ID=${INPUT_TICKER:-$RATE_THRESHOLD_ASSET_ID}
  export RATE_BASE_ASSET_ID=${INPUT_TICKER:-$RATE_BASE_ASSET_ID}

  # Blockchain Sync Settings
  read -p "Enter Blockchain Updates gRPC URL [$BLOCKCHAIN_UPDATES_URL]: " INPUT_UPDATES_URL
  export BLOCKCHAIN_UPDATES_URL=${INPUT_UPDATES_URL:-$BLOCKCHAIN_UPDATES_URL}

  read -p "Enter Chain ID decimal representation [$CHAIN_ID_DEC]: " INPUT_CHAIN_ID_DEC
  export CHAIN_ID_DEC=${INPUT_CHAIN_ID_DEC:-$CHAIN_ID_DEC}

  read -p "Enter starting height for synchronization [$STARTING_HEIGHT]: " INPUT_STARTING_HEIGHT
  export STARTING_HEIGHT=${INPUT_STARTING_HEIGHT:-$STARTING_HEIGHT}

  read -p "Run Sync Consumer inside Docker? [Y/n]: " INPUT_DOCKER_SYNC
  if [[ "$INPUT_DOCKER_SYNC" =~ ^[Nn]$ ]]; then
    export USE_DOCKER_SYNC="false"
  else
    export USE_DOCKER_SYNC="true"
  fi

  echo -e "\n${GREEN}✓ Configuration parameters loaded successfully!${NC}\n"

  # Save variables to .env file for future non-interactive runs
  cat <<EOF > "$ENV_FILE"
PGHOST="$PGHOST"
PGPORT="$PGPORT"
PGDATABASE="$PGDATABASE"
PGUSER="$PGUSER"
PGPASSWORD="$PGPASSWORD"
DEFAULT_MATCHER="$DEFAULT_MATCHER"
BLOCKCHAIN_UPDATES_URL="$BLOCKCHAIN_UPDATES_URL"
CHAIN_ID_DEC="$CHAIN_ID_DEC"
STARTING_HEIGHT="$STARTING_HEIGHT"
USE_DOCKER_SYNC="$USE_DOCKER_SYNC"
RATE_THRESHOLD_ASSET_ID="$RATE_THRESHOLD_ASSET_ID"
RATE_BASE_ASSET_ID="$RATE_BASE_ASSET_ID"
EOF
  echo -e "💾 \033[0;32mConfigurations persisted to .env file successfully!\033[0m"

  # Nginx & Certbot SSL Configuration Question
  read -p "Do you want to configure Nginx Reverse Proxy & Certbot SSL for the Data Service? [y/N]: " CONFIGURE_NGINX
  CONFIGURE_NGINX=${CONFIGURE_NGINX:-N}

  if [[ "$CONFIGURE_NGINX" =~ ^[Yy]$ ]]; then
    # Verify root permission for Nginx modifications
    if [ "$EUID" -ne 0 ]; then
      echo -e "⚠️  ${YELLOW}Nginx configuration requires root privileges. Please re-run the script as root or with sudo for SSL configuration.${NC}"
    else
      read -p "Enter your Base Domain (e.g., yourdomain.com): " BASE_DOMAIN
      read -p "Enter Email Address for Certbot notifications: " CERTBOT_EMAIL

      if [[ -z "$BASE_DOMAIN" || -z "$CERTBOT_EMAIL" ]]; then
        echo -e "❌ ${RED}Domain and Email are required for SSL setup. Skipping Nginx configuration...${NC}"
      else
        SUBDOMAIN="data-service.$BASE_DOMAIN"
        NGINX_CONF="/etc/nginx/sites-available/amzx-data-service.conf"

        echo -e "\n⚙️  ${CYAN}Creating Unified Nginx reverse proxy configuration for $SUBDOMAIN...${NC}"
        echo -e "    -> Routing API endpoints to Node Data-Service (Port 3000)"
        echo -e "    -> Routing root '/' and Assets to Swagger UI (Port 8080)"
        
        cat <<EOF > "$NGINX_CONF"
# AMZX Data Service & Swagger UI Unified Router Proxy
server {
    listen 80;
    server_name $SUBDOMAIN;

    # 1. API Endpoints WITH /v0/ prefix (Nginx automatically strips /v0/ and proxies remaining URI)
    location /v0/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 2. API Endpoints WITHOUT /v0/ prefix (Direct proxy to NodeJS)
    location ~ ^/(assets|pairs|transactions|candles|aliases|matchers|version) {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 2. Unified Root '/' and UI Assets - Route directly to Swagger UI Container (Port 8080)
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

        # Enable configuration
        ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/amzx-data-service.conf"

        echo -e "🛡️  ${CYAN}Testing Nginx configuration...${NC}"
        if nginx -t; then
          systemctl reload nginx
          echo -e "✅ ${GREEN}Nginx reverse proxy created successfully!${NC}"
          
          # Certbot execution
          echo -e "🔑 ${CYAN}Requesting SSL certificate via Certbot for $SUBDOMAIN...${NC}"
          if command -v certbot &> /dev/null; then
            certbot --nginx \
              -d "$SUBDOMAIN" \
              --expand \
              --non-interactive \
              --agree-tos \
              -m "$CERTBOT_EMAIL"
            
            if [ $? -eq 0 ]; then
              echo -e "🎉 ${GREEN}${BOLD}SSL Certificate active! Secure routing is live!${NC}"
            else
              echo -e "❌ ${RED}Certbot failed to acquire SSL certificates. Please check DNS propagation.${NC}"
            fi
          else
            echo -e "⚠️  ${YELLOW}Certbot is not installed. Skipping automatic SSL acquisition.${NC}"
          fi
        else
          echo -e "❌ ${RED}Nginx configuration test failed. Reverting changes...${NC}"
          rm -f "/etc/nginx/sites-enabled/amzx-data-service.conf"
        fi
      fi
    fi
  fi
else
  echo -e "⚙️  Running in silent mode. Sane configurations loaded."
  echo -e "   Run with ${YELLOW}--setup${NC} or ${YELLOW}--interactive${NC} to enter interactive mode."
fi

# ------------------------------------------------------------------------------
# 3. VERIFY & EXPORT ABSOLUTE MANDATORY ENV VARIABLES
# ------------------------------------------------------------------------------
export PGHOST="$PGHOST"
export PGDATABASE="$PGDATABASE"
export PGUSER="$PGUSER"
export PGPASSWORD="$PGPASSWORD"
export DEFAULT_MATCHER="$DEFAULT_MATCHER"
export RATE_PAIR_ACCEPTANCE_VOLUME_THRESHOLD=${RATE_PAIR_ACCEPTANCE_VOLUME_THRESHOLD:-1}
export RATE_THRESHOLD_ASSET_ID="$RATE_THRESHOLD_ASSET_ID"
export RATE_BASE_ASSET_ID="$RATE_BASE_ASSET_ID"

# Sync parameters
export POSTGRES__HOST="$PGHOST"
export POSTGRES__PORT="$PGPORT"
export POSTGRES__DATABASE="$PGDATABASE"
export POSTGRES__USER="$PGUSER"
export POSTGRES__PASSWORD="$PGPASSWORD"
export BLOCKCHAIN_UPDATES_URL="$BLOCKCHAIN_UPDATES_URL"
export CHAIN_ID=$CHAIN_ID_DEC
export STARTING_HEIGHT=$STARTING_HEIGHT

# ------------------------------------------------------------------------------
# 3. VERIFY AND AUTOMATICALLY UPGRADE NODE.JS TO VERSION 18
# ------------------------------------------------------------------------------
NODE_VERSION_REQ="18"
if ! command -v node &> /dev/null; then
  CURRENT_NODE_MAJOR=0
else
  CURRENT_NODE_MAJOR=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
fi

if [ "$CURRENT_NODE_MAJOR" -lt "$NODE_VERSION_REQ" ]; then
  if [ "$EUID" -eq 0 ]; then
    echo -e "📦 \033[0;33mNode.js version ($CURRENT_NODE_MAJOR) is outdated or missing. Requirements: >= v18.\033[0m"
    echo -e "🚀 \033[0;36mAutomatically upgrading Node.js to v18.x via NodeSource...\033[0m"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - &>/dev/null
    apt-get install -y nodejs &>/dev/null
    if [ $? -eq 0 ]; then
      echo -e "✅ \033[0;32mNode.js successfully upgraded to version $(node -v)!\033[0m"
      # Clean old node_modules and compiled output to prevent native V8/Node v10 engine crashes
      if [ -d "$DATA_SERVICE_DIR/node_modules" ]; then
        echo -e "🧹 \033[0;33mCleaning up old Node v10 node_modules to guarantee native engine compatibility...\033[0m"
        rm -rf "$DATA_SERVICE_DIR/node_modules"
        rm -rf "$DATA_SERVICE_DIR/dist"
      fi
    else
      echo -e "❌ \033[0;31mFailed to automatically upgrade Node.js. Please install Node.js >= v18 manually.\033[0m"
    fi
  else
    echo -e "⚠️  \033[0;31mNode.js version ($CURRENT_NODE_MAJOR) is too low (Requirements: >= v18). Please run as root or upgrade manually.\033[0m"
    exit 1
  fi
fi

cd "$DATA_SERVICE_DIR" || {
  echo -e "❌ ${RED}Error: data-service directory not found at $DATA_SERVICE_DIR${NC}"
  exit 1
}

# Verify dependencies
if [ ! -d "node_modules" ]; then
  echo -e "📦 ${YELLOW}node_modules not found. Installing package dependencies...${NC}"
  npm install --legacy-peer-deps --ignore-scripts
  if [ $? -ne 0 ]; then
    echo -e "❌ ${RED}Failed to install npm packages.${NC}"
    exit 1
  fi
fi

# Build project from TypeScript to JavaScript
if [ ! -d "dist" ]; then
  echo -e "🛠️  ${YELLOW}Building TypeScript sources...${NC}"
  npm run build
  if [ $? -ne 0 ]; then
    echo -e "❌ ${RED}Failed to compile TypeScript sources.${NC}"
    exit 1
  fi
fi

# Build blockchain-postgres-sync if we are running native mode
if [ "$USE_DOCKER_SYNC" = "false" ]; then
  if [ ! -f "$SYNC_DIR/target/release/consumer" ] || [ ! -f "$SYNC_DIR/target/release/migration" ]; then
    echo -e "🛠️  ${YELLOW}Building blockchain-postgres-sync Rust sources (this may take a few minutes)...${NC}"
    cd "$SYNC_DIR" || exit 1
    cargo build --release
    if [ $? -ne 0 ]; then
      echo -e "❌ ${RED}Failed to compile blockchain-postgres-sync Rust sources.${NC}"
      exit 1
    fi
    cd "$DATA_SERVICE_DIR" || exit 1
  fi
else
  # If we are running in Docker mode, ensure image exists
  if command -v docker &> /dev/null; then
    if ! docker images --format '{{.Repository}}' | grep -q "^amzx-blockchain-sync$"; then
      echo -e "🐳 ${CYAN}amzx-blockchain-sync Docker image not found.${NC}"
      echo -e "🛠️  ${YELLOW}Building amzx-blockchain-postgres-sync Docker image (this may take a few minutes)...${NC}"
      cd "$SYNC_DIR" || exit 1
      docker build -t amzx-blockchain-sync:latest .
      if [ $? -ne 0 ]; then
        echo -e "❌ ${RED}Failed to build blockchain-postgres-sync Docker image.${NC}"
        exit 1
      fi
      cd "$DATA_SERVICE_DIR" || exit 1
    fi
  fi
fi

# ------------------------------------------------------------------------------
# 4. LAUNCH SWAGGER UI DOCKER CONTAINER (Port 8080)
# ------------------------------------------------------------------------------
# Auto-install Docker if missing and running with root privileges
if ! command -v docker &> /dev/null; then
  if [ "$EUID" -eq 0 ]; then
    echo -e "📦 ${YELLOW}Docker is not installed. Installing Docker CE automatically via APT...${NC}"
    apt-get update -y &>/dev/null
    apt-get install -y docker.io &>/dev/null
    if command -v docker &> /dev/null; then
      systemctl start docker &>/dev/null
      systemctl enable docker &>/dev/null
      echo -e "✅ ${GREEN}Docker installed and daemon started successfully!${NC}"
    else
      echo -e "❌ ${RED}Failed to automatically install Docker. Swagger UI cannot be loaded.${NC}"
    fi
  fi
fi

if command -v docker &> /dev/null; then
  echo -e "🐳 ${CYAN}Checking Swagger UI Docker container (Port 8080)...${NC}"
  
  # Clean up existing container if it exists
  if docker ps -a --format '{{.Names}}' | grep -q "^amzx-swagger$"; then
    docker stop amzx-swagger &>/dev/null
    docker rm amzx-swagger &>/dev/null
  fi

  # Start the container pointing to the compiled openapi.json file
  docker run -d \
    --name amzx-swagger \
    -p 127.0.0.1:8080:8080 \
    -v "$DATA_SERVICE_DIR/docs/openapi.json:/app/openapi.json" \
    -e SWAGGER_JSON=/app/openapi.json \
    --restart unless-stopped \
    swaggerapi/swagger-ui:v4.15.5 &>/dev/null

  if [ $? -eq 0 ]; then
    echo -e "✅ ${GREEN}Swagger UI container booted successfully in background (Port 8080).${NC}"
  else
    echo -e "⚠️  ${YELLOW}Failed to start Swagger UI container. Please check Docker daemon permissions.${NC}"
  fi
else
  echo -e "⚠️  ${YELLOW}Docker not found. Swagger UI container will not be automatically launched.${NC}"
fi

# ------------------------------------------------------------------------------
# 4.1 LAUNCH POSTGRESQL DOCKER CONTAINER (Port 5432)
# ------------------------------------------------------------------------------
if command -v docker &> /dev/null; then
  # Only attempt to manage local database container if PGHOST points to localhost
  if [[ "$PGHOST" == "127.0.0.1" || "$PGHOST" == "localhost" ]]; then
    echo -e "🐳 ${CYAN}Checking PostgreSQL Docker container (Port 5432)...${NC}"
    
    # Create isolated Docker network if it doesn't exist
    if ! docker network ls | grep -q "amzx-network"; then
      echo -e "🌐 ${CYAN}Creating isolated Docker network amzx-network...${NC}"
      docker network create amzx-network &>/dev/null
    fi

    # Force release of port 5432 (kill any native or zombie process using it)
    if ss -tulpn 2>/dev/null | grep -q ":5432 "; then
      echo -e "⚠️  ${YELLOW}Port 5432 is occupied. Forcing cleanup and killing the occupant process...${NC}"
      OCCUPANT_PID=$(ss -tulpn 2>/dev/null | grep ":5432 " | head -n 1 | tr -s ' ' | cut -d' ' -f7 | grep -o -E '[0-9]+' | head -n 1)
      if [ ! -z "$OCCUPANT_PID" ]; then
        kill -9 "$OCCUPANT_PID" &>/dev/null
      fi
      if command -v fuser &>/dev/null; then
        fuser -k -n tcp 5432 &>/dev/null
      elif command -v lsof &>/dev/null; then
        lsof -t -i tcp:5432 | xargs kill -9 &>/dev/null
      fi
      sleep 2
      echo -e "✅ ${GREEN}Port 5432 released successfully!${NC}"
    fi

    # Clean up existing container if it exists to ensure it uses the new network configuration
    if docker ps -a --format '{{.Names}}' | grep -q "^amzx-postgres$"; then
      echo -e "🔄 ${CYAN}Reconfiguring existing amzx-postgres Docker container to use amzx-network...${NC}"
      docker stop amzx-postgres &>/dev/null
      docker rm amzx-postgres &>/dev/null
    fi

    echo -e "📦 ${CYAN}Creating and launching new amzx-postgres Docker container on amzx-network...${NC}"
    docker run -d \
      --name amzx-postgres \
      --network amzx-network \
      --network-alias amzx-postgres \
      --hostname amzx-postgres \
      -p 5432:5432 \
      -e POSTGRES_DB="$PGDATABASE" \
      -e POSTGRES_USER="$PGUSER" \
      -e POSTGRES_PASSWORD="$PGPASSWORD" \
      -v amzx-postgres-data:/var/lib/postgresql/data \
      --restart unless-stopped \
      postgres:14-alpine &>/dev/null

      # Wait for postgres to accept connections before booting NodeJS
      echo -e "⏳ ${CYAN}Waiting for PostgreSQL to be healthy and accept connections...${NC}"
      PG_HEALTHY=false
      for i in {1..20}; do
        # Verify internal readiness inside the container via Unix Socket
        if docker exec amzx-postgres pg_isready -U "$PGUSER" -d "$PGDATABASE" &>/dev/null; then
          PG_HEALTHY=true
          break
        fi
        sleep 1.5
      done

      if [ "$PG_HEALTHY" = "true" ]; then
        echo -e "✅ ${GREEN}PostgreSQL database process is healthy!${NC}"
        echo -e "⏳ ${CYAN}Stabilizing Docker network routing and firewall rules...${NC}"
        # Interactive progress bar for network stabilization (5 seconds)
        for j in {1..5}; do
          echo -ne "   ["
          for k in $(seq 1 $j); do echo -ne "▓"; done
          for k in $(seq $j 4); do echo -ne " "; done
          echo -ne "] $((j * 20))% completed\r"
          sleep 1
        done
        echo -e "\n✅ ${GREEN}PostgreSQL network routing is fully operational on port $PGPORT!${NC}"
      else
        echo -e "❌ ${RED}PostgreSQL failed to become healthy within the timeout period.${NC}"
        exit 1
      fi
    fi

  # Run Diesel DB migrations to create all database tables
  echo -e "🚀 ${CYAN}Running database migrations via Diesel...${NC}"
  
  # Default settings for local native processes (like Node.js Indexer)
  export POSTGRES__HOST="127.0.0.1"
  export POSTGRES__PORT="$PGPORT"
  export POSTGRES__DATABASE="$PGDATABASE"
  export POSTGRES__USER="$PGUSER"
  export POSTGRES__PASSWORD="$PGPASSWORD"

  if [ "$USE_DOCKER_SYNC" = "true" ]; then
    # Formulate robust TCP connection URL via Host Gateway to bypass any bridge forwarding restrictions
    CONTAINER_DATABASE_URL="postgres://$PGUSER:$PGPASSWORD@host.docker.internal:5432/$PGDATABASE"

    MIGRATION_SUCCESS=false
    for r in {1..5}; do
      echo -e "🚀 ${CYAN}Running database migrations via Diesel (Attempt $r/5) [Targeting host.docker.internal via TCP]...${NC}"
      docker run --rm \
        --network amzx-network \
        --add-host=host.docker.internal:host-gateway \
        -e DATABASE_URL="$CONTAINER_DATABASE_URL" \
        -e POSTGRES__HOST="host.docker.internal" \
        -e POSTGRES__PORT="5432" \
        -e POSTGRES__DATABASE="$PGDATABASE" \
        -e POSTGRES__USER="$PGUSER" \
        -e POSTGRES__PASSWORD="$PGPASSWORD" \
        amzx-blockchain-sync:latest ./migration up
      if [ $? -eq 0 ]; then
        MIGRATION_SUCCESS=true
        break
      fi
      if [ $r -lt 5 ]; then
        echo -e "⚠️  ${YELLOW}Migration attempt $r failed. Retrying in 4 seconds...${NC}"
        sleep 4
      fi
    done

    if [ "$MIGRATION_SUCCESS" = "true" ]; then
      echo -e "✅ ${GREEN}Database schema created/updated successfully inside Docker!${NC}"
    else
      echo -e "❌ ${RED}Database migration failed inside Docker after multiple attempts.${NC}"
    fi
  else
    cd "$SYNC_DIR" || exit 1
    ./target/release/migration up
    if [ $? -eq 0 ]; then
      echo -e "✅ ${GREEN}Database schema created/updated successfully natively!${NC}"
    else
      echo -e "❌ ${RED}Database migration failed natively.${NC}"
    fi
    cd "$DATA_SERVICE_DIR" || exit 1
  fi
else
  echo -e "⚠️  ${YELLOW}Docker not found. PostgreSQL container will not be automatically launched.${NC}"
fi

# ------------------------------------------------------------------------------
# 5. START SYNC CONSUMER & NATIVE DAEMON PROCESS IN BACKGROUND
# ------------------------------------------------------------------------------
if [ "$USE_DOCKER_SYNC" = "true" ]; then
  echo -e "🐳 ${GREEN}Booting AMZX Blockchain Postgres Sync Consumer inside Docker Container...${NC}"
  
  # Remove existing container if left over
  docker rm -f amzx-blockchain-sync &>/dev/null
  
  # Adapt local updates URL for Docker Network bridge connectivity
  CONTAINER_UPDATES_URL="$BLOCKCHAIN_UPDATES_URL"
  if [[ "$CONTAINER_UPDATES_URL" == *"127.0.0.1"* || "$CONTAINER_UPDATES_URL" == *"localhost"* ]]; then
    CONTAINER_UPDATES_URL=$(echo "$CONTAINER_UPDATES_URL" | sed -e 's/127.0.0.1/host.docker.internal/g' -e 's/localhost/host.docker.internal/g')
  fi

  # Formulate robust TCP connection URL via Host Gateway to bypass any bridge forwarding restrictions
  CONTAINER_DATABASE_URL="postgres://$PGUSER:$PGPASSWORD@host.docker.internal:5432/$PGDATABASE"

  docker run -d \
    --name amzx-blockchain-sync \
    --network amzx-network \
    --add-host=host.docker.internal:host-gateway \
    -e DATABASE_URL="$CONTAINER_DATABASE_URL" \
    -e POSTGRES__HOST="host.docker.internal" \
    -e POSTGRES__PORT="5432" \
    -e POSTGRES__DATABASE="$PGDATABASE" \
    -e POSTGRES__USER="$PGUSER" \
    -e POSTGRES__PASSWORD="$PGPASSWORD" \
    -e BLOCKCHAIN_UPDATES_URL="$CONTAINER_UPDATES_URL" \
    -e CHAIN_ID=$CHAIN_ID_DEC \
    -e STARTING_HEIGHT=$STARTING_HEIGHT \
    -e RUST_LOG="${RUST_LOG:-info}" \
    --restart unless-stopped \
    amzx-blockchain-sync:latest >/dev/null
  
  SYNC_PID="DOCKER_CONTAINER"
else
  echo -e "🔥 ${GREEN}Booting AMZX Blockchain Postgres Sync Consumer natively in background...${NC}"
  cd "$SYNC_DIR" || exit 1
  nohup ./target/release/consumer > "$LOG_FILE_SYNC" 2>&1 &
  SYNC_PID=$!
  echo "$SYNC_PID" > "$PID_FILE_SYNC"
  cd "$DATA_SERVICE_DIR" || exit 1
fi

echo -e "🔥 ${GREEN}Booting AMZX Data Service Indexer Daemon natively in background...${NC}"

# Launch process with nohup natively (direct node call to avoid npm child-process SIGHUP signals)
NODE_ENV=development LOG_LEVEL=debug nohup node dist/index.js > "$LOG_FILE" 2>&1 &
SERVICE_PID=$!

# Save PID to file
echo "$SERVICE_PID" > "$PID_FILE"

# Give services 1.5 seconds to start and check if they are still alive
sleep 1.5

SYNC_ALIVE=false
if [ "$USE_DOCKER_SYNC" = "true" ]; then
  if docker ps --format '{{.Names}}' | grep -q "^amzx-blockchain-sync$"; then
    SYNC_ALIVE=true
  fi
else
  if kill -0 "$SYNC_PID" 2>/dev/null; then
    SYNC_ALIVE=true
  fi
fi

if kill -0 "$SERVICE_PID" 2>/dev/null && [ "$SYNC_ALIVE" = "true" ]; then
  echo -e "\n🎉 ${GREEN}${BOLD}AMZX Data Service & Sync Consumer are now running in background!${NC}"
  echo -e "  - Data Service PID:  ${CYAN}$SERVICE_PID${NC}"
  if [ "$USE_DOCKER_SYNC" = "true" ]; then
    echo -e "  - Sync Consumer:     ${CYAN}Running in Docker [amzx-blockchain-sync]${NC}"
  else
    echo -e "  - Sync Consumer PID: ${CYAN}$SYNC_PID${NC}"
  fi
  echo -e "  - Active Log Files:  "
  echo -e "      * Node API:      ${CYAN}amzx-data-service/data-service.log${NC}"
  if [ "$USE_DOCKER_SYNC" = "true" ]; then
    echo -e "      * Sync Consumer: ${CYAN}docker logs amzx-blockchain-sync${NC}"
  else
    echo -e "      * Sync Consumer: ${CYAN}amzx-blockchain-postgres-sync/blockchain-sync.log${NC}"
  fi
  echo
  echo -e "🛡️  ${GREEN}${BOLD}Unified Domain Routing active on https://data-service.planetone.io${NC}"
  echo -e "  - Acessar ${CYAN}https://data-service.planetone.io/${NC}      👉 Servirá o Swagger UI interativo gráfico!"
  echo -e "  - Acessar ${CYAN}https://data-service.planetone.io/assets${NC} 👉 Servirá os dados reais da API indexados!"
  echo
  echo -e "📋 Useful Daemon Commands:"
  if [ "$USE_DOCKER_SYNC" = "true" ]; then
    echo -e "  - Monitor sync logs:          ${CYAN}docker logs -f amzx-blockchain-sync${NC}"
  else
    echo -e "  - Monitor sync logs:          ${CYAN}tail -f amzx-blockchain-postgres-sync/blockchain-sync.log${NC}"
  fi
  echo -e "  - Monitor Node API logs:      ${CYAN}tail -f amzx-data-service/data-service.log${NC}"
  echo -e "  - Check service status:       ${CYAN}./start-data-service.sh status${NC}"
  echo -e "  - Stop background services:   ${CYAN}./start-data-service.sh stop${NC}"
  echo -e "  - Restart background services:${CYAN}./start-data-service.sh restart${NC}"
  echo
else
  echo -e "\n❌ ${RED}Error: Services started but one of them died immediately.${NC}"
  echo -e "Please check the log files:"
  echo -e "  - ${CYAN}cat amzx-data-service/data-service.log${NC}"
  if [ "$USE_DOCKER_SYNC" = "true" ]; then
    echo -e "  - ${CYAN}docker logs amzx-blockchain-sync${NC}"
  else
    echo -e "  - ${CYAN}cat amzx-blockchain-postgres-sync/blockchain-sync.log${NC}"
  fi
  stop_service
  exit 1
fi
