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
        # Limpar configurações conflitantes conhecidas
        rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
        rm -f /etc/nginx/sites-enabled/amzx-data-service.conf 2>/dev/null || true

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
else
    echo -e "  - Systemctl não disponível neste ambiente."
fi
echo

# ------------------------------------------------------------------------------
# 2. DETECÇÃO DA PASTA DE EXECUÇÃO DA REDE AMZX (run-amzx-*)
# ------------------------------------------------------------------------------
echo -e "🔷 ${CYAN}${BOLD}[2/5] Detecção da Configuração da Rede Ativa${NC}"

RUN_DIR=""
if [ -d "$WIZARD_DIR" ]; then
    RUN_DIR=$(find "$WIZARD_DIR" -maxdepth 1 -name "run-amzx-*" -type d | head -n 1)
fi

if [ -z "$RUN_DIR" ] || [ ! -d "$RUN_DIR" ]; then
    RUN_DIR=$(find "$SCRIPT_DIR" -maxdepth 2 -name "run-amzx-*" -type d 2>/dev/null | head -n 1)
fi

if [ -n "$RUN_DIR" ] && [ -d "$RUN_DIR" ]; then
    echo -e "  - Pasta de Rede:     📁 ${GREEN}${BOLD}$RUN_DIR${NC}"
    
    # Extrair Chain ID se existir
    CHAIN_ID=$(basename "$RUN_DIR" | sed 's/run-amzx-//')
    echo -e "  - Chain ID:          🔷 ${CYAN}${BOLD}$CHAIN_ID${NC}"
else
    echo -e "  ⚠️  ${YELLOW}Nenhuma pasta de execução 'run-amzx-*' encontrada em $WIZARD_DIR${NC}"
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
echo

# ------------------------------------------------------------------------------
# 4. DIAGNÓSTICO E AUTO-CURA DO MATCHER DEX (Porta 6886)
# ------------------------------------------------------------------------------
echo -e "🔷 ${CYAN}${BOLD}[4/5] Matcher DEX AMZX (Orderbook & Engine de Negociação)${NC}"

MATCHER_ONLINE=false
if ss -tulpn 2>/dev/null | grep -q ":6886 " || curl -s -m 2 http://127.0.0.1:6886/matcher &>/dev/null; then
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
echo -e "${CYAN}${BOLD}--- 🌐 TESTE DE CONECTIVIDADE DOS DOMÍNIOS ---${NC}"

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

    if [[ "$HTTP_CODE" =~ ^(200|301|302|404|401)$ ]]; then
        echo -e "  - ${GREEN}✓ ONLINE${NC}  [$HTTP_CODE] ${CYAN}${URL}${NC}"
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
