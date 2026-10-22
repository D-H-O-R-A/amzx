#!/usr/bin/env bash
# ==============================================================================
# AMZX BLOCKCHAIN & SERVICES - SYSTEMD AUTOSTART & RESILIENCE PROVISIONER
# ==============================================================================
# Configura serviços systemd com Restart=always e autostart no boot do sistema.
# Garante que após reboots do VPS (Hostinger, AWS, DigitalOcean, etc.),
# o nó AMZX, Matcher DEX e Data Service voltem automaticamente sem perda de dados!
# ==============================================================================

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}==============================================================================${NC}"
echo -e "${CYAN}${BOLD}  🔷  AMZX AUTOSTART & SYSTEMD RESILIENCE PROVISIONER (VPS BOOT AUTO-HEAL)  🔷${NC}"
echo -e "${CYAN}${BOLD}==============================================================================${NC}"
echo

# 1. Verificar permissões sudo/root
if [ "$EUID" -ne 0 ] && ! command -v sudo &>/dev/null; then
    echo -e "${RED}${BOLD}[ERRO] Este script requer privilégios de root ou sudo para registrar serviços systemd.${NC}"
    exit 1
fi

SUDO_CMD=""
if [ "$EUID" -ne 0 ]; then
    SUDO_CMD="sudo"
fi

SYSTEM_USER="${SUDO_USER:-$USER}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOME_DIR=$(getent passwd "$SYSTEM_USER" | cut -d: -f6)
HOME_DIR=${HOME_DIR:-$HOME}

# 2. Localizar o diretório de execução do nó (onde ficam start-node.sh e blockchain.conf)
NODE_DIR=""
CANDIDATES=(
    "$SCRIPT_DIR"
    "$SCRIPT_DIR/amz-network-wizard"
    "$HOME_DIR/amzx-network-pro/node"
    "$HOME_DIR/amzx-network-pro"
    "$HOME_DIR/run-node"
    "$HOME_DIR/run-validator"
    "$PWD"
)

# Se o processo estiver rodando, tentar extrair a partir dele
if pgrep -f "com.wavesplatform.Application" &>/dev/null; then
    PROC_CONF=$(ps aux | grep "com.wavesplatform.Application" | grep -oE '/[^ ]+blockchain\.conf' | head -n 1 || true)
    if [ -n "$PROC_CONF" ] && [ -f "$PROC_CONF" ]; then
        NODE_DIR="$(dirname "$PROC_CONF")"
    fi
fi

if [ -z "$NODE_DIR" ]; then
    for cand in "${CANDIDATES[@]}"; do
        if [ -d "$cand" ] && [ -f "$cand/start-node.sh" ]; then
            NODE_DIR="$(realpath "$cand")"
            break
        fi
    done
fi

if [ -z "$NODE_DIR" ]; then
    FOUND=$(find "$HOME_DIR" -maxdepth 4 -name "start-node.sh" 2>/dev/null | head -n 1 || true)
    if [ -n "$FOUND" ]; then
        NODE_DIR="$(dirname "$FOUND")"
    fi
fi

if [ -z "$NODE_DIR" ] || [ ! -f "$NODE_DIR/start-node.sh" ]; then
    echo -e "${YELLOW}Não foi possível detectar automaticamente a pasta do nó com start-node.sh.${NC}"
    read -p "Por favor, informe o caminho absoluto da pasta onde fica o start-node.sh: " USER_NODE_DIR
    if [ -d "$USER_NODE_DIR" ] && [ -f "$USER_NODE_DIR/start-node.sh" ]; then
        NODE_DIR="$(realpath "$USER_NODE_DIR")"
    else
        echo -e "${RED}${BOLD}[ERRO] start-node.sh não encontrado em $USER_NODE_DIR.${NC}"
        exit 1
    fi
fi

echo -e "📁 ${GREEN}Diretório do Nó Localizado:${NC} ${BOLD}$NODE_DIR${NC}"
echo -e "👤 ${GREEN}Usuário do Serviço:${NC}        ${BOLD}$SYSTEM_USER${NC}"
echo

# 3. Configurar amzx-node.service
echo -e "⚙️  ${CYAN}Configurando serviço systemd: ${BOLD}amzx-node.service${NC}..."
$SUDO_CMD bash -c "cat <<EOF > /etc/systemd/system/amzx-node.service
[Unit]
Description=AMZX Blockchain Node
After=network.target network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$SYSTEM_USER
WorkingDirectory=$NODE_DIR
ExecStart=/usr/bin/env bash $NODE_DIR/start-node.sh
Restart=always
RestartSec=5s
SuccessExitStatus=143
LimitNOFILE=65536
StandardOutput=append:$NODE_DIR/node.log
StandardError=append:$NODE_DIR/node.log

[Install]
WantedBy=multi-user.target
EOF"

SERVICES_TO_ENABLE=("amzx-node")

# 4. Configurar amzx-matcher.service se existir start-matcher.sh
if [ -f "$NODE_DIR/start-matcher.sh" ]; then
    echo -e "⚙️  ${CYAN}Configurando serviço systemd: ${BOLD}amzx-matcher.service${NC}..."
    $SUDO_CMD bash -c "cat <<EOF > /etc/systemd/system/amzx-matcher.service
[Unit]
Description=AMZX Matcher DEX
After=network.target amzx-node.service
Wants=amzx-node.service

[Service]
Type=simple
User=$SYSTEM_USER
WorkingDirectory=$NODE_DIR
ExecStart=/usr/bin/env bash $NODE_DIR/start-matcher.sh
Restart=always
RestartSec=5s
SuccessExitStatus=143
LimitNOFILE=65536
StandardOutput=append:$NODE_DIR/matcher.log
StandardError=append:$NODE_DIR/matcher.log

[Install]
WantedBy=multi-user.target
EOF"
    SERVICES_TO_ENABLE+=("amzx-matcher")
fi

# 5. Configurar amzx-data-service.service se existir start-data-service.sh
if [ -f "$NODE_DIR/start-data-service.sh" ]; then
    echo -e "⚙️  ${CYAN}Configurando serviço systemd: ${BOLD}amzx-data-service.service${NC}..."
    $SUDO_CMD bash -c "cat <<EOF > /etc/systemd/system/amzx-data-service.service
[Unit]
Description=AMZX Data Service & PostgreSQL Sync
After=network.target amzx-node.service
Wants=amzx-node.service

[Service]
Type=simple
User=$SYSTEM_USER
WorkingDirectory=$NODE_DIR
ExecStart=/usr/bin/env bash $NODE_DIR/start-data-service.sh
Restart=always
RestartSec=5s
LimitNOFILE=65536
StandardOutput=append:$NODE_DIR/data-service.log
StandardError=append:$NODE_DIR/data-service.log

[Install]
WantedBy=multi-user.target
EOF"
    SERVICES_TO_ENABLE+=("amzx-data-service")
fi

# 6. Recarregar o daemon do systemd e habilitar no boot
echo
echo -e "🔄 ${YELLOW}Recarregando daemon systemd e ativando serviços no boot do VPS...${NC}"
$SUDO_CMD systemctl daemon-reload

for srv in "${SERVICES_TO_ENABLE[@]}"; do
    $SUDO_CMD systemctl enable "$srv"
    echo -e "  ✅ ${GREEN}Habilitado para autostart no boot:${NC} ${BOLD}$srv.service${NC}"
done

echo
read -p "Deseja iniciar ou migrar os serviços agora via systemd? [S/n]: " START_NOW
START_NOW=${START_NOW:-S}

if [[ "$START_NOW" =~ ^[Ss]$ ]]; then
    echo -e "🛑 ${YELLOW}Finalizando processos legados rodando em nohup para transferir ao systemd...${NC}"
    pkill -TERM -f "com.wavesplatform.Application" 2>/dev/null || true
    pkill -TERM -f "com.wavesplatform.dex" 2>/dev/null || true
    pkill -TERM -f "start-data-service.sh" 2>/dev/null || true
    sleep 3

    for srv in "${SERVICES_TO_ENABLE[@]}"; do
        echo -e "🚀 Iniciando ${CYAN}$srv.service${NC} via systemd..."
        $SUDO_CMD systemctl restart "$srv"
    done
    sleep 2
    echo
    echo -e "📊 ${GREEN}${BOLD}Status atual dos serviços systemd:${NC}"
    for srv in "${SERVICES_TO_ENABLE[@]}"; do
        STATUS=$($SUDO_CMD systemctl is-active "$srv" 2>/dev/null || echo "inativo")
        if [ "$STATUS" = "active" ]; then
            echo -e "  - $srv: 🟢 ${GREEN}${BOLD}ATIVO & RODANDO (Protegido por systemd)${NC}"
        else
            echo -e "  - $srv: 🔴 ${RED}${BOLD}STATUS: $STATUS${NC}"
        fi
    done
fi

echo
echo -e "${GREEN}${BOLD}==============================================================================${NC}"
echo -e "${GREEN}${BOLD}       🎉 CONFIGURAÇÃO DE INICIALIZAÇÃO AUTOMÁTICA CONCLUÍDA! 🎉              ${NC}"
echo -e "${GREEN}${BOLD}==============================================================================${NC}"
echo
echo -e "A partir de agora, mesmo que o seu VPS da Hostinger ou servidor reinicie:"
echo -e "  1. O sistema operacional iniciará o ${BOLD}amzx-node${NC} automaticamente no boot."
echo -e "  2. Se qualquer processo parar ou cair por falta de memória (OOM), o systemd"
echo -e "     irá reiniciá-lo automaticamente em 5 segundos (${BOLD}Restart=always${NC})."
echo -e "  3. Nenhum dado da blockchain é perdido nas reinicializações."
echo
echo -e "Comandos úteis para o dia a dia:"
echo -e "  - Ver status do nó:         ${CYAN}sudo systemctl status amzx-node${NC}"
echo -e "  - Acompanhar logs em tempo real: ${CYAN}sudo journalctl -u amzx-node -f${NC}"
echo -e "  - Reiniciar nó com segurança: ${CYAN}sudo systemctl restart amzx-node${NC}"
echo -e "  - Parar nó com segurança:     ${CYAN}sudo systemctl stop amzx-node${NC}"
echo
