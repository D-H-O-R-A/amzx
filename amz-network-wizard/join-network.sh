#!/usr/bin/env bash
# ==============================================================================
# 🔷 AMZX NETWORK - NODE & VALIDATOR ONBOARDING WIZARD
# ==============================================================================
# Interactive tool for new users/operators to join an existing AMZX blockchain
# network as a Validator (Mining/Forging Node) or a Full Peer Node (Sync/API).
# ==============================================================================

set -uo pipefail

# Terminal styling
CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo -e "${CYAN}${BOLD}==============================================================================${NC}"
echo -e "${CYAN}${BOLD}     🔷 AMZX BLOCKCHAIN - NODE & VALIDATOR ONBOARDING WIZARD 🔷               ${NC}"
echo -e "${CYAN}${BOLD}==============================================================================${NC}"
echo -e "${YELLOW}Este assistente configura e inicializa a sua conexão a uma blockchain AMZX ativa.${NC}\n"

# ------------------------------------------------------------------------------
# STEP 1: VERIFICAR PRÉ-REQUISITOS (JAVA & FAT JAR)
# ------------------------------------------------------------------------------
echo -e "🔷 ${CYAN}${BOLD}[1/7] Verificação do Ambiente e Compilação${NC}"

if ! command -v java &>/dev/null; then
    echo -e "${RED}${BOLD}[ERRO] Java 17 não encontrado. Instale com: sudo apt install openjdk-17-jdk -y${NC}"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -n 1)
echo -e "  - Java Runtime:      🟢 ${GREEN}$JAVA_VERSION${NC}"

# Localizar Fat JAR do Nó
FAT_JAR=$(find "$PROJECT_ROOT/node/target" "$SCRIPT_DIR/.." -name "waves-all-*.jar" 2>/dev/null | head -n 1)
if [ -z "$FAT_JAR" ] || [ ! -f "$FAT_JAR" ]; then
    echo -e "  ⚠️  ${YELLOW}Fat JAR do nó não encontrado. Compilando com SBT...${NC}"
    cd "$PROJECT_ROOT"
    sbt node/assembly
    FAT_JAR=$(find "$PROJECT_ROOT/node/target" -name "waves-all-*.jar" | head -n 1)
    if [ -z "$FAT_JAR" ] || [ ! -f "$FAT_JAR" ]; then
        echo -e "${RED}${BOLD}[ERRO] Falha ao compilar o Fat JAR do nó AMZX.${NC}"
        exit 1
    fi
fi
echo -e "  - Fat JAR do Nó:     🟢 ${GREEN}$(basename "$FAT_JAR")${NC}"
echo

# ------------------------------------------------------------------------------
# STEP 2: ESCOLHA DO PAPEL NA REDE (ROLE)
# ------------------------------------------------------------------------------
echo -e "🔷 ${CYAN}${BOLD}[2/7] Seleção de Perfil na Rede${NC}"
echo -e "  1) ${BOLD}Validador / Minerador PoS${NC} (Forja e valida blocos na rede via Proof-of-Stake)"
echo -e "  2) ${BOLD}Nó Completo / Sincronizador${NC} (Apenas baixa blocos, serve API e propaga transações)"
echo
read -p "Escolha o papel desejado [1-2, default: 1]: " NODE_ROLE_CHOICE
NODE_ROLE_CHOICE=${NODE_ROLE_CHOICE:-1}

IS_VALIDATOR=true
if [ "$NODE_ROLE_CHOICE" = "2" ]; then
    IS_VALIDATOR=false
    echo -e "👉 ${GREEN}Perfil selecionado: Nó Completo (Sincronizador / API)${NC}"
else
    echo -e "👉 ${GREEN}Perfil selecionado: Validador / Minerador PoS${NC}"
fi
echo

# ------------------------------------------------------------------------------
# STEP 3: CRIAÇÃO / IMPORTAÇÃO DA SEED E SENHAS
# ------------------------------------------------------------------------------
echo -e "🔷 ${CYAN}${BOLD}[3/7] Carteira, Seed e Chaves Criptográficas${NC}"
echo -e "  1) Gerar uma ${BOLD}nova Seed Mnemônica aleatória${NC} segura"
echo -e "  2) Importar uma ${BOLD}Seed existente${NC}"
echo
read -p "Opção de Seed [1-2, default: 1]: " SEED_OPT
SEED_OPT=${SEED_OPT:-1}

SEED_PHRASE=""
if [ "$SEED_OPT" = "2" ]; then
    read -p "Cole a sua Seed Phrase existente: " SEED_PHRASE
    if [ -z "$SEED_PHRASE" ]; then
        echo -e "${RED}Seed não pode estar vazia.${NC}"
        exit 1
    fi
else
    # Gerar seed aleatória usando python / openssl
    SEED_PHRASE=$(python3 -c "
import secrets
words = ['planet', 'quantum', 'galaxy', 'matrix', 'orbital', 'crypto', 'blockchain', 'validator', 'consensus', 'harmony', 'solar', 'vector', 'genesis', 'alpha', 'node', 'zenith', 'pulse', 'strata', 'beacon', 'infinity']
print(' '.join(secrets.choice(words) for _ in range(15)))
")
    echo -e "🔑 ${BOLD}Nova Seed Gerada:${NC} ${GREEN}$SEED_PHRASE${NC}"
    echo -e "⚠️  ${YELLOW}${BOLD}ATENÇÃO: Guarde esta Seed em local seguro! Ela é a chave da sua conta.${NC}"
fi
echo

# Senha da carteira para criptografia do wallet.dat
echo -e "🔒 ${BOLD}Configuração de Segurança do Arquivo da Carteira (.dat)${NC}"
echo -e "A carteira será armazenada como um arquivo criptografado (.dat) usando ${BOLD}PBKDF2 (999.999 iterações) e AES-128${NC}."
while true; do
    read -s -p "Digite a senha para criptografar a sua carteira (wallet.dat): " WALLET_PASSWORD
    echo
    if [ ${#WALLET_PASSWORD} -lt 6 ]; then
        echo -e "${RED}⚠️  A senha deve ter pelo menos 6 caracteres.${NC}"
    else
        read -s -p "Confirme a senha da carteira: " WALLET_PASSWORD_CONFIRM
        echo
        if [ "$WALLET_PASSWORD" != "$WALLET_PASSWORD_CONFIRM" ]; then
            echo -e "${RED}⚠️  As senhas não coincidem. Tente novamente.${NC}"
        else
            echo -e "✅ ${GREEN}Senha da carteira definida com sucesso!${NC}"
            break
        fi
    fi
done
echo

# Chave API REST (Swagger)
echo -e "🛡️ ${BOLD}Configuração da Swagger REST API Key${NC}"
while true; do
    read -p "Digite a sua chave Swagger API Key (mínimo 10 caracteres): " REST_API_KEY
    if [ ${#REST_API_KEY} -lt 10 ]; then
        echo -e "${RED}⚠️  A chave da API precisa ter pelo menos 10 caracteres.${NC}"
    elif [ "$REST_API_KEY" = "ridethewaves!" ]; then
        echo -e "${RED}⚠️  A senha padrão 'ridethewaves!' é proibida por segurança.${NC}"
    else
        echo -e "✅ ${GREEN}REST API Key configurada!${NC}"
        break
    fi
done
echo

# ------------------------------------------------------------------------------
# STEP 4: IMPORTAÇÃO E PARSER DO BLOCO GENESIS
# ------------------------------------------------------------------------------
echo -e "🔷 ${CYAN}${BOLD}[4/7] Configuração do Bloco Genesis da Blockchain${NC}"
echo -e "Você pode informar o Bloco Genesis de 3 formas:"
echo -e "  1) Colar o JSON do Bloco Genesis (ex: bloco height 1 exportado ou gerado)"
echo -e "  2) Informar o caminho de um arquivo local (ex: genesis.json ou blockchain.conf)"
echo -e "  3) Selecionar automaticamente a partir de uma pasta 'run-amzx-*' existente neste servidor"
echo
read -p "Escolha o método de importação do Genesis [1-3, default: 3]: " GENESIS_METHOD
GENESIS_METHOD=${GENESIS_METHOD:-3}

GENESIS_RAW_DATA=""

if [ "$GENESIS_METHOD" = "1" ]; then
    echo -e "${YELLOW}Cole o JSON do Genesis (pressione ENTER, cole e digite 'EOF' em uma nova linha):${NC}"
    GENESIS_JSON_INPUT=""
    while IFS= read -r line; do
        [[ "$line" == "EOF" ]] && break
        GENESIS_JSON_INPUT+="$line"$'\n'
    done
    GENESIS_RAW_DATA="$GENESIS_JSON_INPUT"
elif [ "$GENESIS_METHOD" = "2" ]; then
    read -p "Digite o caminho do arquivo genesis.json / blockchain.conf: " GENESIS_FILE_PATH
    if [ ! -f "$GENESIS_FILE_PATH" ]; then
        echo -e "${RED}Arquivo não encontrado: $GENESIS_FILE_PATH${NC}"
        exit 1
    fi
    GENESIS_RAW_DATA=$(cat "$GENESIS_FILE_PATH")
else
    EXISTING_CONF=$(find "$SCRIPT_DIR" "$PROJECT_ROOT" -name "blockchain.conf" 2>/dev/null | head -n 1)
    if [ -n "$EXISTING_CONF" ] && [ -f "$EXISTING_CONF" ]; then
        echo -e "✅ ${GREEN}Configuração Genesis detectada automaticamente em: $EXISTING_CONF${NC}"
        GENESIS_RAW_DATA=$(cat "$EXISTING_CONF")
    else
        echo -e "${RED}Nenhuma configuração existente encontrada. Cole o JSON do Genesis manualmente.${NC}"
        exit 1
    fi
fi

# Parser Python para extrair Chain ID e formatar o bloco Genesis em HOCON
PARSER_SCRIPT=$(cat << 'EOF'
import sys, json, re

raw = sys.stdin.read().strip()
b58_chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

def b58decode(s):
    num = 0
    for c in s:
        num = num * 58 + b58_chars.index(c)
    res = []
    while num > 0:
        res.append(num % 256)
        num //= 256
    pad = 0
    for c in s:
        if c == '1': pad += 1
        else: break
    return bytes([0]*pad + res[::-1])

chain_id = "P"
genesis_hocon = ""

# Se for arquivo HOCON com genesis { ... }
if "genesis {" in raw or "address-scheme-character" in raw:
    # Extrair chain_id
    m_chain = re.search(r'address-scheme-character\s*=\s*["\']?([^"\'\s]+)', raw)
    if m_chain:
        chain_id = m_chain.group(1).upper()
    
    m_gen = re.search(r'(genesis\s*\{.*?\n\s*\})', raw, re.DOTALL)
    if m_gen:
        genesis_hocon = m_gen.group(1)

if not genesis_hocon:
    # Tentar parsear como JSON
    try:
        # Limpar possiveis prefixos
        json_str = raw
        if raw.startswith("result:"):
            json_str = raw[7:].strip()
        data = json.loads(json_str)

        # Se for bloco completo
        ts = data.get("timestamp", 1784672365854)
        sig = data.get("signature", data.get("id", ""))
        base_target = 4
        if "nxt-consensus" in data and "base-target" in data["nxt-consensus"]:
            base_target = data["nxt-consensus"]["base-target"]
        
        txs = data.get("transactions", [])
        tx_hocon = []
        total_balance = 0
        
        for tx in txs:
            rec = tx.get("recipient", "")
            amt = tx.get("amount", 0)
            total_balance += amt
            if rec and len(rec) >= 26:
                try:
                    dec = b58decode(rec)
                    if len(dec) >= 2 and dec[0] == 1:
                        chain_id = chr(dec[1]).upper()
                except Exception:
                    pass
            tx_hocon.append(f"          {{\n            recipient = \"{rec}\"\n            amount = {amt}\n          }}")
        
        txs_formatted = ",\n".join(tx_hocon) if tx_hocon else ""
        if total_balance == 0:
            total_balance = 100000000000000000

        genesis_hocon = f"""genesis {{
        average-block-delay = 60s
        initial-base-target = {base_target}
        timestamp = {ts}
        block-timestamp = {ts}
        signature = "{sig}"
        initial-balance = {total_balance}
        transactions = [
{txs_formatted}
        ]
      }}"""
    except Exception as e:
        sys.stderr.write(f"Erro no parser JSON: {e}\n")

print(f"CHAIN_ID:{chain_id}")
print("GENESIS_HOCON_START")
print(genesis_hocon)
print("GENESIS_HOCON_END")
EOF
)

PARSED_OUTPUT=$(echo "$GENESIS_RAW_DATA" | python3 -c "$PARSER_SCRIPT")
CHAIN_ID=$(echo "$PARSED_OUTPUT" | grep "CHAIN_ID:" | cut -d':' -f2 | tr -d '[:space:]')
CHAIN_ID=${CHAIN_ID:-P}
GENESIS_HOCON_BLOCK=$(echo "$PARSED_OUTPUT" | sed -n '/GENESIS_HOCON_START/,/GENESIS_HOCON_END/p' | grep -v "GENESIS_HOCON_")

if [ -z "$GENESIS_HOCON_BLOCK" ]; then
    echo -e "${RED}${BOLD}[ERRO] Não foi possível extrair a configuração do Bloco Genesis.${NC}"
    exit 1
fi

echo -e "  - Chain ID Detectado:🔷 ${GREEN}${BOLD}$CHAIN_ID${NC}"
echo -e "  - Bloco Genesis:     🟢 ${GREEN}Formatado com sucesso.${NC}"
echo

# ------------------------------------------------------------------------------
# STEP 5: PEER CONHECIDO (IP DO VALIDADOR) & DERIVAÇÃO DO ENDEREÇO
# ------------------------------------------------------------------------------
echo -e "🔷 ${CYAN}${BOLD}[5/7] Conexão P2P & Consulta de Saldo no Validador${NC}"

read -p "Digite o IP ou Domínio de um Validador existente (ex: nodes.planetone.io ou 123.45.67.89): " PEER_HOST
PEER_HOST=${PEER_HOST:-nodes.planetone.io}

read -p "Porta P2P do Validador [default: 6868]: " PEER_P2P_PORT
PEER_P2P_PORT=${PEER_P2P_PORT:-6868}

read -p "URL REST API do Validador para consulta de saldo [default: https://${PEER_HOST}]: " PEER_API_URL
PEER_API_URL=${PEER_API_URL:-https://${PEER_HOST}}

# Derivar chaves e endereço usando Java / Fat JAR
TEMP_KEY_DIR=$(mktemp -d)
cat << 'EOF' > "$TEMP_KEY_DIR/Deriver.java"
public class Deriver {
    public static void main(String[] args) {
        try {
            String seedStr = args[0];
            char chainId = args[1].charAt(0);
            String apiKey = args[2];

            // Chave Blake2b API Key Hash
            byte[] apiKeyHashBytes = com.wavesplatform.crypto.package$.MODULE$.secureHash(apiKey.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            String apiKeyHash = com.wavesplatform.common.utils.Base58$.MODULE$.encode(apiKeyHashBytes);

            // Derivar par de chaves da seed
            scala.util.Either either = com.wavesplatform.account.KeyPair$.MODULE$.fromSeed(seedStr);
            com.wavesplatform.account.SeedKeyPair kp = (com.wavesplatform.account.SeedKeyPair) either.right().get();

            byte[] privKey = kp.privateKey().arr();
            byte[] pubKey = kp.publicKey().arr();
            String privKeyB58 = com.wavesplatform.common.utils.Base58$.MODULE$.encode(privKey);
            String pubKeyB58 = com.wavesplatform.common.utils.Base58$.MODULE$.encode(pubKey);

            // Gerar endereço para o Chain ID específico
            com.wavesplatform.account.Address addr = com.wavesplatform.account.Address$.MODULE$.fromPublicKey(kp.publicKey(), (byte) chainId);
            String addressStr = addr.toString();

            System.out.println("DERIVED_ADDRESS:" + addressStr);
            System.out.println("DERIVED_PUBKEY:" + pubKeyB58);
            System.out.println("DERIVED_PRIVKEY:" + privKeyB58);
            System.out.println("API_KEY_HASH:" + apiKeyHash);
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(1);
        }
    }
}
EOF

KEY_OUT=""
if command -v javac &>/dev/null; then
    javac -cp "$FAT_JAR" -d "$TEMP_KEY_DIR" "$TEMP_KEY_DIR/Deriver.java" 2>/dev/null || true
    if [ -f "$TEMP_KEY_DIR/Deriver.class" ]; then
        KEY_OUT=$(java -cp "$FAT_JAR:$TEMP_KEY_DIR" Deriver "$SEED_PHRASE" "$CHAIN_ID" "$REST_API_KEY" 2>/dev/null)
    fi
fi

if [ -z "$KEY_OUT" ]; then
    KEY_OUT=$(java -cp "$FAT_JAR" "$TEMP_KEY_DIR/Deriver.java" "$SEED_PHRASE" "$CHAIN_ID" "$REST_API_KEY" 2>/dev/null)
fi
rm -rf "$TEMP_KEY_DIR"

ACCOUNT_ADDRESS=$(echo "$KEY_OUT" | grep "DERIVED_ADDRESS:" | cut -d':' -f2 | tr -d '[:space:]')
PUBLIC_KEY=$(echo "$KEY_OUT" | grep "DERIVED_PUBKEY:" | cut -d':' -f2 | tr -d '[:space:]')
PRIVATE_KEY=$(echo "$KEY_OUT" | grep "DERIVED_PRIVKEY:" | cut -d':' -f2 | tr -d '[:space:]')
API_KEY_HASH=$(echo "$KEY_OUT" | grep "API_KEY_HASH:" | cut -d':' -f2 | tr -d '[:space:]')

echo -e "  - Seu Endereço:      🛡️  ${GREEN}${BOLD}$ACCOUNT_ADDRESS${NC}"
echo -e "  - Chave Pública:     🔑 ${CYAN}$PUBLIC_KEY${NC}"
echo

# Remover barra no final da URL se houver
PEER_API_URL="${PEER_API_URL%/}"

# Consultar saldo do endereço no nó remoto
echo -e "🔍 Consultando saldo de mineração na rede ($PEER_API_URL)..."
BALANCE_RESP=$(curl -s -k -m 4 "$PEER_API_URL/addresses/balance/$ACCOUNT_ADDRESS" 2>/dev/null || echo "{}")
BALANCE_SATOSHIS=$(echo "$BALANCE_RESP" | grep -o '"balance":[0-9]*' | cut -d':' -f2 || echo "0")
BALANCE_SATOSHIS=${BALANCE_SATOSHIS:-0}
BALANCE_COINS=$(python3 -c "print(f'{$BALANCE_SATOSHIS / 100000000:.4f}')" 2>/dev/null || echo "0.0000")

# 1000 moedas nativas (100.000.000.000 satoshis) é o requisito padrão de geração
MIN_REQ_SATOSHIS=100000000000

echo -e "  - Saldo Atual:       💰 ${BOLD}$BALANCE_COINS moedas${NC} ($BALANCE_SATOSHIS unidades mínimas)"

if [ "$IS_VALIDATOR" = true ]; then
    if [ "$BALANCE_SATOSHIS" -ge "$MIN_REQ_SATOSHIS" ]; then
        echo -e "  ✅ ${GREEN}${BOLD}Saldo Qualificado! Seu nó começará a forjar blocos imediatamente após a sincronização.${NC}"
    else
        echo -e "  ℹ️  ${YELLOW}Saldo atual insuficiente para forjar (mínimo: 1.000 moedas).${NC}"
        echo -e "     ${YELLOW}O nó iniciará sincronizando todo o histórico e passará a forjar assim que receber saldo ou leasing.${NC}"
    fi
fi
echo

# ------------------------------------------------------------------------------
# STEP 6: CRIAÇÃO DA PASTA ISOLADA E ARQUIVOS DE CONFIGURAÇÃO
# ------------------------------------------------------------------------------
echo -e "🔷 ${CYAN}${BOLD}[6/7] Criação da Pasta de Execução e Arquivos de Configuração${NC}"

RUN_DIR_NAME="run-node-$CHAIN_ID"
if [ "$IS_VALIDATOR" = true ]; then
    RUN_DIR_NAME="run-validator-$CHAIN_ID"
fi

read -p "Nome da pasta de execução [default: $RUN_DIR_NAME]: " RUN_DIR_INPUT
RUN_DIR_NAME=${RUN_DIR_INPUT:-$RUN_DIR_NAME}
NODE_RUN_DIR="$SCRIPT_DIR/$RUN_DIR_NAME"

mkdir -p "$NODE_RUN_DIR/node-data/wallet"
mkdir -p "$NODE_RUN_DIR/lib"
chmod 700 "$NODE_RUN_DIR"

# Copiar extensões compiladas
if [ -d "$PROJECT_ROOT/custom-network/lib" ]; then
    cp "$PROJECT_ROOT/custom-network/lib"/*.jar "$NODE_RUN_DIR/lib/" 2>/dev/null || true
fi

# Copiar bibliotecas ficus e scalapb se existirem no cache
find ~/.cache/coursier/v1 ~/.ivy2/cache -name "*ficus_3*.jar" -exec cp {} "$NODE_RUN_DIR/lib/" \; 2>/dev/null || true
find ~/.cache/coursier/v1 ~/.ivy2/cache -name "*scalapb-runtime_3*.jar" -exec cp {} "$NODE_RUN_DIR/lib/" \; 2>/dev/null || true

# Configurar portas locais
LOCAL_REST_PORT=6869
LOCAL_P2P_PORT=6868

# Se as portas padrão estiverem em uso no host, sugerir portas alternativas
if ss -tulpn 2>/dev/null | grep -q ":6869 "; then
    LOCAL_REST_PORT=6879
fi
if ss -tulpn 2>/dev/null | grep -q ":6868 "; then
    LOCAL_P2P_PORT=6878
fi

MINER_ENABLED="no"
if [ "$IS_VALIDATOR" = true ]; then
    MINER_ENABLED="yes"
fi

# Gerar blockchain.conf com wallet.dat criptografada
CONF_FILE="$NODE_RUN_DIR/blockchain.conf"

cat << EOF > "$CONF_FILE"
waves {
  directory = "$NODE_RUN_DIR/node-data"

  blockchain {
    type = CUSTOM
    custom {
      address-scheme-character = "$CHAIN_ID"
      
      functionality {
        feature-check-blocks-period = 100
        blocks-for-feature-activation = 80
        generation-balance-depth-from-50-to-1000-after-height = 0
        reset-effective-balances-at-height = 0
        block-version-3-after-height = 0
        pre-activated-features {
          1 = 0, 2 = 0, 3 = 0, 4 = 0, 5 = 0, 6 = 0, 7 = 0, 8 = 0, 9 = 0, 10 = 0,
          11 = 0, 12 = 0, 13 = 0, 14 = 0, 15 = 0, 16 = 0, 17 = 0, 18 = 0, 19 = 0,
          20 = 0, 21 = 0, 22 = 0, 23 = 0, 24 = 0, 25 = 0
        }
        double-features-periods-after-height = 1000000000
        max-transaction-time-back-offset = 120m
        max-transaction-time-forward-offset = 90m
        lease-expiration = 1000000
        min-asset-info-update-interval = 7
        min-block-time = 5s
        delay-delta = 8
      }
      
      rewards {
        term = 100000
        term-after-capped-reward-feature = 100000
        initial = 600000000
        min-increment = 50000000
        voting-interval = 10000
      }
      
      $GENESIS_HOCON_BLOCK
    }
  }

  network {
    bind-address = "0.0.0.0"
    port = $LOCAL_P2P_PORT
    known-peers = ["$PEER_HOST:$PEER_P2P_PORT"]
    node-name = "$RUN_DIR_NAME"
    traffic-watcher {
      stop-sending-threshold = 100 MB
    }
  }

  wallet {
    file = "$NODE_RUN_DIR/node-data/wallet/wallet.dat"
    password = "$WALLET_PASSWORD"
    seed = "$SEED_PHRASE"
  }

  rest-api {
    enable = yes
    bind-address = "127.0.0.1"
    port = $LOCAL_REST_PORT
    api-key-hash = "$API_KEY_HASH"
    minimum-peers = 0
  }

  miner {
    enable = $MINER_ENABLED
    quorum = 1
    interval-after-last-block-then-generation-is-allowed = 120h
    micro-block-interval = 5s
    minimal-generation-offset = 0s
    private-keys = ["$PRIVATE_KEY"]
  }
}
EOF

# Gerar scripts start-node.sh e stop-node.sh
cat << EOF > "$NODE_RUN_DIR/start-node.sh"
#!/usr/bin/env bash
SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
FAT_JAR="$FAT_JAR"

echo "🚀 Iniciando Nó AMZX ($RUN_DIR_NAME)..."

EXTRA_CP=""
if [ -d "\$SCRIPT_DIR/lib" ]; then
  for jar in "\$SCRIPT_DIR/lib"/*.jar; do
    if [ -f "\$jar" ]; then
      EXTRA_CP="\${EXTRA_CP}:\${jar}"
    fi
  done
fi

java \\
  -cp "\${FAT_JAR}\${EXTRA_CP}" \\
  -Dlogback.configurationFile="\$SCRIPT_DIR/logback.xml" \\
  com.wavesplatform.Application \\
  "\$SCRIPT_DIR/blockchain.conf"
EOF

chmod +x "$NODE_RUN_DIR/start-node.sh"

cat << EOF > "$NODE_RUN_DIR/stop-node.sh"
#!/usr/bin/env bash
SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
PID=\$(ps aux | grep "com.wavesplatform.Application" | grep "\$SCRIPT_DIR/blockchain.conf" | awk '{print \$2}')

if [ -n "\$PID" ]; then
  echo "🛑 Parando nó AMZX (PID: \$PID)..."
  kill \$PID
  sleep 2
  echo "✅ Nó parado."
else
  echo "Nó não está em execução."
fi
EOF

chmod +x "$NODE_RUN_DIR/stop-node.sh"

echo -e "  - Pasta Criada:      📁 ${GREEN}$NODE_RUN_DIR${NC}"
echo -e "  - Configuração:      📄 ${GREEN}$CONF_FILE${NC}"
echo -e "  - Script de Start:   🚀 ${GREEN}$NODE_RUN_DIR/start-node.sh${NC}"
echo

# ------------------------------------------------------------------------------
# STEP 7: INICIALIZAÇÃO DO NÓ
# ------------------------------------------------------------------------------
echo -e "🔷 ${CYAN}${BOLD}[7/7] Inicialização da Sincronização${NC}"
echo
read -p "Deseja iniciar o seu nó agora em segundo plano? [S/n]: " START_NOW
START_NOW=${START_NOW:-S}

if [[ "$START_NOW" =~ ^[Ss]$ ]]; then
    cd "$NODE_RUN_DIR"
    nohup ./start-node.sh < /dev/null > node.log 2>&1 &
    NODE_PID=$!
    echo -e "✅ ${GREEN}${BOLD}Nó iniciado com sucesso em segundo plano! (PID: $NODE_PID)${NC}"
    echo
    echo -e "Para acompanhar os logs em tempo real:"
    echo -e "  👉 ${CYAN}tail -f $NODE_RUN_DIR/node.log${NC}"
    echo
    echo -e "Para consultar a altura sincronizada localmente:"
    echo -e "  👉 ${CYAN}curl http://127.0.0.1:$LOCAL_REST_PORT/blocks/height${NC}"
else
    echo -e "Para iniciar o nó manualmente mais tarde, execute:"
    echo -e "  👉 ${CYAN}cd $NODE_RUN_DIR && nohup ./start-node.sh < /dev/null > node.log 2>&1 &${NC}"
fi

echo
echo -e "${CYAN}${BOLD}==============================================================================${NC}"
echo -e "${GREEN}${BOLD}     🎉 CONFIGURAÇÃO E INTEGRAÇÃO DO NÓ CONCLUÍDAS COM SUCESSO! 🎉             ${NC}"
echo -e "${CYAN}${BOLD}==============================================================================${NC}"
echo
