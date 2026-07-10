#!/usr/bin/env bash
# ==============================================================================
# AMZX DATA SERVICE LAUNCHER & CONFIGURATION WIZARD (Interactive & Non-Interactive)
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

echo -e "${CYAN}==============================================================================${NC}"
echo -e "${CYAN}${BOLD}             🔷  AMZX BLOCKCHAIN DATA SERVICE INDEXER WIZARD  🔷${NC}"
echo -e "${CYAN}==============================================================================${NC}"

# Check if running with interactive flags
INTERACTIVE_MODE=false
if [[ "$1" == "--setup" || "$1" == "-i" || "$1" == "--interactive" ]]; then
  INTERACTIVE_MODE=true
fi

# ------------------------------------------------------------------------------
# 1. INTERACTIVE SETUP FLOW (If requested)
# ------------------------------------------------------------------------------
if [ "$INTERACTIVE_MODE" = true ]; then
  echo -e "${YELLOW}Entering interactive configuration mode...${NC}\n"

  # PostgreSQL Settings
  read -p "Enter PostgreSQL Host [127.0.0.1]: " INPUT_PGHOST
  export PGHOST=${INPUT_PGHOST:-"127.0.0.1"}

  read -p "Enter PostgreSQL Port [5432]: " INPUT_PGPORT
  export PGPORT=${INPUT_PGPORT:-"5432"}

  read -p "Enter PostgreSQL Database Name [amzx_db]: " INPUT_PGDATABASE
  export PGDATABASE=${INPUT_PGDATABASE:-"amzx_db"}

  read -p "Enter PostgreSQL Username [postgres]: " INPUT_PGUSER
  export PGUSER=${INPUT_PGUSER:-"postgres"}

  read -s -p "Enter PostgreSQL Password [postgres]: " INPUT_PGPASSWORD
  echo
  export PGPASSWORD=${INPUT_PGPASSWORD:-"postgres"}

  # Matcher and Rebranding
  read -p "Enter Matcher Public Key [2eEUvypDSivnzPiLrbYEW39SM8yMZ1aq4eJuiKfs4sEY]: " INPUT_MATCHER
  export DEFAULT_MATCHER=${INPUT_MATCHER:-"2eEUvypDSivnzPiLrbYEW39SM8yMZ1aq4eJuiKfs4sEY"}

  read -p "Enter Native Token Ticker [AMZX]: " INPUT_TICKER
  export RATE_THRESHOLD_ASSET_ID=${INPUT_TICKER:-"AMZX"}
  export RATE_BASE_ASSET_ID=${INPUT_TICKER:-"AMZX"}

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

        echo -e "\n⚙️  ${CYAN}Creating Nginx reverse proxy configuration for $SUBDOMAIN...${NC}"
        
        cat <<EOF > "$NGINX_CONF"
# AMZX Data Service Indexer Proxy
server {
    listen 80;
    server_name $SUBDOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
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
              echo -e "🎉 ${GREEN}${BOLD}SSL Certificate active! Your secure indexer is live at: https://$SUBDOMAIN/docs${NC}"
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
  # ------------------------------------------------------------------------------
  # 2. DEFAULT SILENT / ENVIRONMENT LOADING (Non-Interactive)
  # ------------------------------------------------------------------------------
  export PORT=${PORT:-3000}
  export PGHOST=${PGHOST:-"127.0.0.1"}
  export PGPORT=${PGPORT:-"5432"}
  export PGDATABASE=${PGDATABASE:-"amzx_db"}
  export PGUSER=${PGUSER:-"postgres"}
  export PGPASSWORD=${PGPASSWORD:-"postgres"}
  export DEFAULT_MATCHER=${DEFAULT_MATCHER:-"2eEUvypDSivnzPiLrbYEW39SM8yMZ1aq4eJuiKfs4sEY"}
  export RATE_THRESHOLD_ASSET_ID=${RATE_THRESHOLD_ASSET_ID:-"AMZX"}
  export RATE_BASE_ASSET_ID=${RATE_BASE_ASSET_ID:-"AMZX"}

  echo -e "⚙️  Running in silent mode. Sane configurations loaded."
  echo -e "   Run with ${YELLOW}--setup${NC} or ${YELLOW}--interactive${NC} to enter interactive mode."
fi

# ------------------------------------------------------------------------------
# 3. SERVICE LAUNCHER
# ------------------------------------------------------------------------------
echo -e "\n📋 Configuration Loaded:"
echo -e "  - REST API Port:              ${GREEN}$PORT${NC}"
echo -e "  - PostgreSQL Connection:      ${GREEN}$PGUSER@$PGHOST:$PGPORT/$PGDATABASE${NC}"
echo -e "  - Default Matcher Address:    ${GREEN}$DEFAULT_MATCHER${NC}"
echo -e "  - Native Token Ticker:        ${GREEN}$RATE_BASE_ASSET_ID${NC}"
echo

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

echo -e "🔥 ${GREEN}Booting AMZX Data Service Indexer Daemon...${NC}\n"
exec npm run dev
