#!/usr/bin/env bash
# ==============================================================================
# 🩺 AMZX NETWORK DOCTOR & SELF-HEALING SYSTEM
# ==============================================================================
# Automated diagnostic, health monitor, and self-healing recovery tool exclusively
# for the AMZX Private Blockchain Network, Matcher DEX, Data Service, and Nginx.
# ==============================================================================

set -u

# Terminal Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}==============================================================================${NC}"
echo -e "${CYAN}${BOLD}           🩺  AMZX BLOCKCHAIN NETWORK DOCTOR & AUTO-HEALER  🩺               ${NC}"
echo -e "${CYAN}${BOLD}==============================================================================${NC}"
echo

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WIZARD_DIR="$SCRIPT_DIR/amz-network-wizard"
if [ ! -d "$WIZARD_DIR" ]; then
    WIZARD_DIR="$SCRIPT_DIR"
fi

# Processar argumento de reinicialização limpa
if [ "${1:-}" = "--restart" ] || [ "${1:-}" = "-r" ] || [ "${1:-}" = "restart" ]; then
    echo -e "🔄 ${YELLOW}${BOLD}Modo de reinicialização limpa ativado (preservando 100% dos dados da blockchain)...${NC}"
    echo -e "  - Parando processos ativos de forma segura..."
    pkill -f "com.wavesplatform.Application" 2>/dev/null || true
    pkill -f "dex/run" 2>/dev/null || true
    pkill -f "com.wavesplatform.dex.Application" 2>/dev/null || true
    pkill -f "start-data-service.sh" 2>/dev/null || true
    pkill -f "node dist/index.js" 2>/dev/null || true
    sleep 3
    if command -v systemctl &>/dev/null; then
        for srv in $(systemctl list-units --all --type=service --no-legend 2>/dev/null | awk '{print $1}' | grep "fullexplorer-" || true); do
            sudo systemctl restart "$srv" 2>/dev/null || true
        done
    fi
    echo -e "  ✅ ${GREEN}Processos pausados. O auto-curador irá agora reiniciar toda a stack a partir do último bloco...${NC}\n"
fi

# ------------------------------------------------------------------------------
# 1. APACHE VS NGINX PORT 80 CONFLICT RESOLVER
# ------------------------------------------------------------------------------
echo -e "🔷 ${CYAN}${BOLD}[1/5] Verificação do Servidor Web & Proxy Reverso (Nginx / Apache)${NC}"

if command -v systemctl &>/dev/null; then
    # Desativar Apache se estiver rodando e sequestrando a porta 80
    if systemctl is-active --quiet apache2 2>/dev/null || (command -v ss &>/dev/null && ss -tulpn 2>/dev/null | grep ":80 " | grep -q "apache2"); then
        echo -e "  ⚠️  ${YELLOW}Detectado Apache2 ocupando a porta 80. Desativando para liberar para o Nginx...${NC}"
        systemctl stop apache2 2>/dev/null || true
        systemctl disable apache2 2>/dev/null || true
        echo -e "  ✅ ${GREEN}Apache2 parado e desativado com sucesso.${NC}"
    fi

    # Verificar e recuperar Nginx
    if systemctl is-active --quiet nginx 2>/dev/null; then
        echo -e "  - Nginx Service:     🟢 ${GREEN}${BOLD}ONLINE (Ativo & Rodando)${NC}"
    else
        echo -e "  - Nginx Service:     🔴 ${RED}${BOLD}OFFLINE / FALHOU${NC}"
        echo -e "  🔄 ${CYAN}Tentando recuperar o Nginx automaticamente...${NC}"
        # Limpar configurações conflitantes conhecidas (apenas default)
        rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

        if nginx -t 2>/dev/null; then
            systemctl restart nginx 2>/dev/null || true
            systemctl enable nginx 2>/dev/null || true
            if systemctl is-active --quiet nginx 2>/dev/null; then
                echo -e "  ✅ ${GREEN}Nginx recuperado e iniciado com sucesso!${NC}"
            else
                echo -e "  ❌ ${RED}Falha ao iniciar o Nginx. Verifique: systemctl status nginx${NC}"
            fi
        else
            echo -e "  ❌ ${RED}Erro na sintaxe de configuração do Nginx (nginx -t falhou).${NC}"
        fi
    fi
    # Verificar se existe configuração de nó secundário (node-*.conf) com porta incorreta
    for nconf in /etc/nginx/sites-enabled/node-*.conf /etc/nginx/sites-available/node-*.conf; do
        if [ -f "$nconf" ]; then
            NODE_ACTIVE_PORT=""
            if ss -tulpn 2>/dev/null | grep -q ":6869 "; then
                NODE_ACTIVE_PORT=6869
            elif ss -tulpn 2>/dev/null | grep -q ":6879 "; then
                NODE_ACTIVE_PORT=6879
            fi
            if [ -n "$NODE_ACTIVE_PORT" ]; then
                CONF_PORT=$(grep -oE "proxy_pass http://127.0.0.1:[0-9]+" "$nconf" | head -n 1 | awk -F':' '{print $3}')
                if [ -n "$CONF_PORT" ] && [ "$CONF_PORT" != "$NODE_ACTIVE_PORT" ]; then
                    echo -e "  ⚠️  ${YELLOW}Detectado Nginx em $(basename "$nconf") apontando para porta $CONF_PORT, mas o nó está na $NODE_ACTIVE_PORT! Corrigindo...${NC}"
                    sed -i "s/127\.0\.0\.1:$CONF_PORT/127\.0\.0\.1:$NODE_ACTIVE_PORT/g" "$nconf"
                    nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || true
                    echo -e "  ✅ ${GREEN}Proxy reajustado para porta $NODE_ACTIVE_PORT e Nginx recarregado!${NC}"
                fi
            fi
        fi
    done
else
    echo -e "  - Systemctl não disponível neste ambiente."
fi
echo

# ------------------------------------------------------------------------------
# 2. DETECÇÃO DA PASTA DE EXECUÇÃO DA REDE AMZX (run-amzx-*, run-validator-*, run-node-*)
# ------------------------------------------------------------------------------
echo -e "🔷 ${CYAN}${BOLD}[2/5] Detecção da Configuração da Rede Ativa${NC}"

RUN_DIR=""
if [ -d "$WIZARD_DIR" ]; then
    RUN_DIR=$(find "$WIZARD_DIR" -maxdepth 1 \( -name "run-amzx-*" -o -name "run-validator-*" -o -name "run-node-*" \) -type d | head -n 1)
fi

if [ -z "$RUN_DIR" ] || [ ! -d "$RUN_DIR" ]; then
    RUN_DIR=$(find "$SCRIPT_DIR" -maxdepth 2 \( -name "run-amzx-*" -o -name "run-validator-*" -o -name "run-node-*" \) -type d 2>/dev/null | head -n 1)
fi

if [ -n "$RUN_DIR" ] && [ -d "$RUN_DIR" ]; then
    echo -e "  - Pasta de Rede:     📁 ${GREEN}${BOLD}$RUN_DIR${NC}"
    
    # Extrair Chain ID se existir
    CHAIN_ID=$(basename "$RUN_DIR" | sed -E 's/run-(amzx|validator|node)-//')
    echo -e "  - Chain ID:          🔷 ${CYAN}${BOLD}$CHAIN_ID${NC}"
else
    echo -e "  ⚠️  ${YELLOW}Nenhuma pasta de execução 'run-*' encontrada em $WIZARD_DIR${NC}"
fi
echo

# ------------------------------------------------------------------------------
# 3. DIAGNÓSTICO E AUTO-CURA DO NÓ BLOCKCHAIN (Porta 6869)
# ------------------------------------------------------------------------------
echo -e "🔷 ${CYAN}${BOLD}[3/5] Nó Blockchain AMZX (REST API / P2P / Mineração)${NC}"

NODE_ONLINE=false
if ss -tulpn 2>/dev/null | grep -q ":6869 " || curl -s -m 2 http://127.0.0.1:6869/node/version &>/dev/null; then
    NODE_ONLINE=true
    HEIGHT=$(curl -s -m 2 http://127.0.0.1:6869/blocks/height 2>/dev/null | grep -o '"height":[0-9]*' | cut -d':' -f2 || echo "Ativo")
    VERSION=$(curl -s -m 2 http://127.0.0.1:6869/node/version 2>/dev/null | grep -o '"version":"[^"]*"' | cut -d'"' -f4 || echo "AMZX 1.6")
    echo -e "  - Status do Nó:      🟢 ${GREEN}${BOLD}ONLINE (Porta 6869)${NC}"
    echo -e "  - Altura Atual:      🧱 ${CYAN}Bloco $HEIGHT${NC}"
    echo -e "  - Versão do Nó:      📦 ${CYAN}$VERSION${NC}"
else
    echo -e "  - Status do Nó:      🔴 ${RED}${BOLD}OFFLINE (Porta 6869 fechada)${NC}"
    if [ -n "$RUN_DIR" ] && [ -f "$RUN_DIR/start-node.sh" ]; then
        echo -e "  🔄 ${CYAN}Reiniciando Nó Blockchain a partir do último bloco (sem apagar dados)...${NC}"
        cd "$RUN_DIR"
        nohup ./start-node.sh < /dev/null > node.log 2>&1 &
        sleep 2
        echo -e "  ✅ ${GREEN}Comando de inicialização enviado. Acompanhe em: $RUN_DIR/node.log${NC}"
    else
        echo -e "  ⚠️  ${YELLOW}Script start-node.sh não encontrado.${NC}"
    fi
fi

# 3.2 Conectividade P2P e Verificação do Firewall UFW
P2P_PORT=6868
if [ -n "$RUN_DIR" ] && [ -f "$RUN_DIR/blockchain.conf" ]; then
    CONF_P2P=$(grep -E 'port\s*=\s*[0-9]+' "$RUN_DIR/blockchain.conf" | head -n 1 | awk '{print $3}' || true)
    if [ -n "$CONF_P2P" ]; then
        P2P_PORT="$CONF_P2P"
    fi

    # Verificar se bind-address está incorretamente como 127.0.0.1
    if grep -A 5 "network {" "$RUN_DIR/blockchain.conf" 2>/dev/null | grep -q 'bind-address = "127.0.0.1"'; then
        echo -e "  ⚠️  ${YELLOW}Detectado network.bind-address = '127.0.0.1'. Corrigindo para '0.0.0.0' para permitir P2P externo...${NC}"
        sed -i '/network {/,/}/ s/bind-address = "127.0.0.1"/bind-address = "0.0.0.0"/' "$RUN_DIR/blockchain.conf"
        echo -e "  ✅ ${GREEN}blockchain.conf atualizado com bind-address = '0.0.0.0'.${NC}"
    fi
fi

if ss -tulpn 2>/dev/null | grep -E "(0\.0\.0\.0|\*):$P2P_PORT "; then
    PEER_COUNT=$(curl -s -m 2 http://127.0.0.1:6869/peers/connected 2>/dev/null | grep -o '"address"' | wc -l || echo "0")
    echo -e "  - Porta P2P ($P2P_PORT):    🟢 ${GREEN}${BOLD}ONLINE (Escutando conexões externas em 0.0.0.0)${NC}"
    echo -e "  - Peers Conectados:  🤝 ${CYAN}$PEER_COUNT peers ativos${NC}"
elif ss -tulpn 2>/dev/null | grep -q "127\.0\.0\.1:$P2P_PORT "; then
    echo -e "  - Porta P2P ($P2P_PORT):    🟡 ${YELLOW}${BOLD}AVISO: Escutando APENAS em 127.0.0.1 (Conexões externas bloqueadas)${NC}"
    echo -e "    Dica: Execute ./amzx-doctor.sh --restart para aplicar o bind em 0.0.0.0."
else
    echo -e "  - Porta P2P ($P2P_PORT):    🔴 ${RED}${BOLD}OFFLINE / Não escutando${NC}"
fi

# Verificar e garantir liberação da porta no Firewall UFW
if command -v ufw &>/dev/null; then
    UFW_STATUS=$(sudo ufw status 2>/dev/null | grep -i "Status: active" || true)
    if [ -n "$UFW_STATUS" ]; then
        if sudo ufw status 2>/dev/null | grep -q "$P2P_PORT.*ALLOW"; then
            echo -e "  - Firewall UFW:      🟢 ${GREEN}Porta $P2P_PORT/tcp liberada no firewall UFW${NC}"
        else
            echo -e "  - Firewall UFW:      🟡 ${YELLOW}Porta $P2P_PORT bloqueada no UFW. Liberando automaticamente...${NC}"
            sudo ufw allow "$P2P_PORT/tcp" 2>/dev/null || true
            sudo ufw allow "80/tcp" 2>/dev/null || true
            sudo ufw allow "443/tcp" 2>/dev/null || true
            echo -e "  ✅ ${GREEN}Regras do firewall UFW adicionadas com sucesso ($P2P_PORT/tcp, 80/tcp, 443/tcp)!${NC}"
        fi
    else
        echo -e "  - Firewall UFW:      ⚪ ${CYAN}UFW inativo (liberado a nível de OS)${NC}"
    fi
fi
echo

# ------------------------------------------------------------------------------
# 4. DIAGNÓSTICO E AUTO-CURA DO MATCHER DEX (Porta 6886)
# ------------------------------------------------------------------------------
echo -e "🔷 ${CYAN}${BOLD}[4/5] Matcher DEX AMZX (Orderbook & Engine de Negociação)${NC}"

MATCHER_ONLINE=false
if [ -n "$RUN_DIR" ] && [[ "$(basename "$RUN_DIR")" =~ run-(validator|node)- ]]; then
    echo -e "  - Status Matcher:    ⚪ ${CYAN}Dispensado (Instância de Nó Secundário/Validador)${NC}"
elif ss -tulpn 2>/dev/null | grep -q ":6886 " || curl -s -m 2 http://127.0.0.1:6886/matcher &>/dev/null; then
    MATCHER_ONLINE=true
    echo -e "  - Status Matcher:    🟢 ${GREEN}${BOLD}ONLINE (Porta 6886)${NC}"
else
    echo -e "  - Status Matcher:    🔴 ${RED}${BOLD}OFFLINE (Porta 6886 fechada)${NC}"
    if [ -n "$RUN_DIR" ] && [ -f "$RUN_DIR/start-matcher.sh" ]; then
        echo -e "  🔄 ${CYAN}Reiniciando Matcher DEX...${NC}"
        cd "$RUN_DIR"
        nohup ./start-matcher.sh < /dev/null > matcher.log 2>&1 &
        sleep 2
        echo -e "  ✅ ${GREEN}Comando do Matcher enviado. Acompanhe em: $RUN_DIR/matcher.log${NC}"
    else
        echo -e "  ⚠️  ${YELLOW}Script start-matcher.sh não encontrado.${NC}"
    fi
fi
echo

# ------------------------------------------------------------------------------
# 5. DIAGNÓSTICO DO DATA SERVICE, POSTGRESQL & SWAGGER
# ------------------------------------------------------------------------------
echo -e "🔷 ${CYAN}${BOLD}[5/5] AMZX Data Service, PostgreSQL & Docker Containers${NC}"

# 5.1 PostgreSQL
if command -v docker &>/dev/null && docker ps --format '{{.Names}}' | grep -q "^amzx-postgres$"; then
    echo -e "  - PostgreSQL:        🟢 ${GREEN}RUNNING (Docker container amzx-postgres: 5432)${NC}"
elif ss -tulpn 2>/dev/null | grep -q ":5432 "; then
    echo -e "  - PostgreSQL:        🟢 ${GREEN}RUNNING (Nativo na porta 5432)${NC}"
else
    echo -e "  - PostgreSQL:        🟡 ${YELLOW}Inativo ou não detectado na porta 5432.${NC}"
fi

# 5.2 Data Service Indexer API (Porta 3000)
if ss -tulpn 2>/dev/null | grep -q ":3000 " || curl -s -m 2 http://127.0.0.1:3000/ &>/dev/null; then
    echo -e "  - Data Service API:  🟢 ${GREEN}${BOLD}ONLINE (Porta 3000)${NC}"
else
    echo -e "  - Data Service API:  ⚪ ${YELLOW}OFFLINE / Inativo${NC}"
    if [ -n "$RUN_DIR" ] && [ -f "$RUN_DIR/start-data-service.sh" ]; then
        echo -e "  🔄 ${CYAN}Iniciando Data Service daemon...${NC}"
        cd "$RUN_DIR"
        nohup ./start-data-service.sh < /dev/null > data-service.log 2>&1 &
        echo -e "  ✅ ${GREEN}Comando do Data Service enviado.${NC}"
    fi
fi

# 5.2b Nginx HTTPS Proxy para Data Service
CERT_DIR="/etc/letsencrypt/live/nodes.planetone.io"
if [ ! -d "$CERT_DIR" ]; then
    CERT_DIR=$(find /etc/letsencrypt/live -name "fullchain.pem" 2>/dev/null | grep "planetone" | head -n 1 | xargs -r dirname)
fi

if [ -n "$CERT_DIR" ] && [ -f "$CERT_DIR/fullchain.pem" ]; then
    NEED_DS_NGINX_UPDATE=false
    if [ ! -f "/etc/nginx/sites-available/amzx-data-service.conf" ]; then
        NEED_DS_NGINX_UPDATE=true
    elif ! grep -A 15 "server_name.*data-service" /etc/nginx/sites-available/amzx-data-service.conf 2>/dev/null | grep -q "listen.*443.*ssl"; then
        NEED_DS_NGINX_UPDATE=true
    fi

    if [ "$NEED_DS_NGINX_UPDATE" = true ]; then
        echo -e "  🔄 ${CYAN}Configurando proxy HTTPS 443 dedicado para Data Service com certificado SSL...${NC}"
        cat <<DS_CONF > /etc/nginx/sites-available/amzx-data-service.conf
# AMZX Data Service HTTP -> HTTPS
server {
    listen 80;
    server_name data-service.planetone.io;
    return 301 https://\$host\$request_uri;
}

# AMZX Data Service HTTPS SSL Proxy
server {
    listen 443 ssl http2;
    server_name data-service.planetone.io;

    ssl_certificate $CERT_DIR/fullchain.pem;
    ssl_certificate_key $CERT_DIR/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

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
DS_CONF
        ln -sf /etc/nginx/sites-available/amzx-data-service.conf /etc/nginx/sites-enabled/amzx-data-service.conf
        if nginx -t 2>/dev/null; then
            systemctl reload nginx 2>/dev/null
            echo -e "  ✅ ${GREEN}Nginx SSL para Data Service ativado e recarregado com sucesso!${NC}"
        fi
    elif [ ! -f "/etc/nginx/sites-enabled/amzx-data-service.conf" ]; then
        ln -sf /etc/nginx/sites-available/amzx-data-service.conf /etc/nginx/sites-enabled/amzx-data-service.conf
        nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null
        echo -e "  ✅ ${GREEN}Link do Nginx para Data Service restaurado com sucesso!${NC}"
    fi
fi

# 5.3 Swagger UI (Porta 8080)
if command -v docker &>/dev/null && docker ps --format '{{.Names}}' | grep -q "^amzx-swagger$"; then
    echo -e "  - Swagger UI:        🟢 ${GREEN}RUNNING (Docker container amzx-swagger: 8080)${NC}"
else
    echo -e "  - Swagger UI:        ⚪ ${YELLOW}Opcional / Inativo${NC}"
fi

# 5.4 Sync Consumer Docker
if command -v docker &>/dev/null && docker ps --format '{{.Names}}' | grep -q "^amzx-blockchain-sync$"; then
    echo -e "  - Blockchain Sync:   🟢 ${GREEN}RUNNING (Docker container amzx-blockchain-sync)${NC}"
else
    echo -e "  - Blockchain Sync:   ⚪ ${YELLOW}Inativo${NC}"
fi
echo

# ------------------------------------------------------------------------------
# TESTE DE CONECTIVIDADE PÚBLICA HTTPS
# ------------------------------------------------------------------------------
echo -e "${CYAN}${BOLD}--- 🌐 TESTE DE CONECTIVIDADE DOS DOMÍNIOS & CERTIFICADOS SSL ---${NC}"

# Detectar se há base_domain configurado no nginx
DOMAINS=(
    "nodes.planetone.io/api-docs/index.html"
    "matcher.planetone.io/api-docs/index.html"
    "rpc.planetone.io"
    "data-service.planetone.io"
    "fullexplorer.planetone.io"
)

for target in "${DOMAINS[@]}"; do
    URL="https://${target}"
    HTTP_CODE=$(curl -s -k -o /dev/null -w "%{http_code}" -m 4 "$URL" 2>/dev/null || echo "000")
    
    # Checar se o certificado SSL é estritamente válido (sem -k)
    SSL_VALID=true
    if ! curl -s -o /dev/null -m 4 "$URL" 2>/dev/null; then
        SSL_VALID=false
    fi

    if [[ "$HTTP_CODE" =~ ^(200|301|302|404|401)$ ]]; then
        if [ "$SSL_VALID" = true ]; then
            echo -e "  - ${GREEN}✓ ONLINE (SSL Válido)${NC}       [$HTTP_CODE] ${CYAN}${URL}${NC}"
        else
            echo -e "  - 🟡 ${YELLOW}ONLINE (SSL Mismatched/Inválido)${NC} [$HTTP_CODE] ${RED}${URL}${NC}"
        fi
    else
        echo -e "  - ${RED}✗ OFFLINE${NC} [$HTTP_CODE] ${YELLOW}${URL}${NC}"
    fi
done

echo
echo -e "${CYAN}${BOLD}==============================================================================${NC}"
echo -e "${GREEN}${BOLD}     ✅ AUDITORIA E AUTO-RECUPERAÇÃO DA REDE AMZX CONCLUÍDAS!     ${NC}"
echo -e "${CYAN}${BOLD}==============================================================================${NC}"
echo -e "Dica: Execute ${CYAN}./amzx-doctor.sh${NC} sempre que quiser verificar ou restaurar a rede."
echo
