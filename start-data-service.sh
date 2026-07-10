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
PID_FILE="$SCRIPT_DIR/data-service.pid"
LOG_FILE="$DATA_SERVICE_DIR/data-service.log"

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

  # Stop Swagger Docker container if running
  if command -v docker &> /dev/null; then
    if docker ps -a --format '{{.Names}}' | grep -q "^amzx-swagger$"; then
      echo -e "🛑 ${YELLOW}Stopping and removing amzx-swagger UI Docker container...${NC}"
      docker stop amzx-swagger &>/dev/null
      docker rm amzx-swagger &>/dev/null
      echo -e "✅ ${GREEN}amzx-swagger Docker container stopped and removed.${NC}"
    fi
  fi
}

status_service() {
  # Indexer Status
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
      echo -e "🟢 ${GREEN}${BOLD}AMZX Data Service Indexer is RUNNING (PID: $PID).${NC}"
    else
      echo -e "🔴 ${RED}AMZX Data Service Indexer PID exists ($PID) but process is DEAD.${NC}"
    fi
  else
    echo -e "⚪ ${YELLOW}AMZX Data Service Indexer is STOPPED.${NC}"
  fi

  # Swagger Docker Status
  if command -v docker &> /dev/null; then
    if docker ps --format '{{.Names}}' | grep -q "^amzx-swagger$"; then
      echo -e "🟢 ${GREEN}${BOLD}Swagger UI Docker Container is RUNNING on internal port 8080.${NC}"
    else
      echo -e "⚪ ${YELLOW}Swagger UI Docker Container is STOPPED/NOT INSTALLED.${NC}"
    fi
  else
    echo -e "⚠️  ${RED}Docker is not installed on this system.${NC}"
  fi
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

  # Matcher and Rebranding Settings
  read -p "Enter Matcher Public Key [$DEFAULT_MATCHER]: " INPUT_MATCHER
  export DEFAULT_MATCHER=${INPUT_MATCHER:-$DEFAULT_MATCHER}

  read -p "Enter Native Token Ticker [$RATE_BASE_ASSET_ID]: " INPUT_TICKER
  export RATE_THRESHOLD_ASSET_ID=${INPUT_TICKER:-$RATE_THRESHOLD_ASSET_ID}
  export RATE_BASE_ASSET_ID=${INPUT_TICKER:-$RATE_BASE_ASSET_ID}

  echo -e "\n${GREEN}✓ Configuration parameters loaded successfully!${NC}\n"

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
# 5. START NATIVE DAEMON PROCESS IN BACKGROUND (Port 3000)
# ------------------------------------------------------------------------------
echo -e "🔥 ${GREEN}Booting AMZX Data Service Indexer Daemon in background...${NC}"

# Launch process with nohup natively (direct node call to avoid npm child-process SIGHUP signals)
NODE_ENV=development LOG_LEVEL=debug nohup node dist/index.js > "$LOG_FILE" 2>&1 &
SERVICE_PID=$!

# Save PID to file
echo "$SERVICE_PID" > "$PID_FILE"

# Give Node.js 1.5 seconds to start and check if it's still alive
sleep 1.5
if kill -0 "$SERVICE_PID" 2>/dev/null; then
  echo -e "\n🎉 ${GREEN}${BOLD}AMZX Data Service is now running in background!${NC}"
  echo -e "  - Process PID:       ${CYAN}$SERVICE_PID${NC}"
  echo -e "  - Process PID File:  ${CYAN}data-service.pid${NC}"
  echo -e "  - Active Log File:   ${CYAN}amzx-data-service/data-service.log${NC}"
  echo
  echo -e "🛡️  ${GREEN}${BOLD}Unified Domain Routing active on https://data-service.planetone.io${NC}"
  echo -e "  - Acessar ${CYAN}https://data-service.planetone.io/${NC}      👉 Servirá o Swagger UI interativo gráfico!"
  echo -e "  - Acessar ${CYAN}https://data-service.planetone.io/assets${NC} 👉 Servirá os dados reais da API indexados!"
  echo
  echo -e "📋 Useful Daemon Commands:"
  echo -e "  - Monitor logs in real-time:  ${CYAN}tail -f amzx-data-service/data-service.log${NC}"
  echo -e "  - Check service status:       ${CYAN}./start-data-service.sh status${NC}"
  echo -e "  - Stop background service:    ${CYAN}./start-data-service.sh stop${NC}"
  echo -e "  - Restart background service: ${CYAN}./start-data-service.sh restart${NC}"
  echo
else
  echo -e "\n❌ ${RED}Error: Service started but died immediately.${NC}"
  echo -e "Please check the log file: ${CYAN}cat amzx-data-service/data-service.log${NC}"
  rm -f "$PID_FILE"
  exit 1
fi
