<h1 align="center">🔷 AMZX Node</h1>

<p align="center">
  <a href="https://github.com/D-H-O-R-A/amzx" target="_blank">
    <img alt="GitHub Repo" src="https://img.shields.io/badge/GitHub-amzx-blue?logo=github" />
  </a>
  <a href="mailto:diegoantunes2301@gmail.com">
    <img alt="Email Contact" src="https://img.shields.io/badge/Email-diegoantunes2301%40gmail.com-red?logo=gmail" />
  </a>
  <a href="https://wa.me/5511974289097" target="_blank">
    <img alt="WhatsApp Contact" src="https://img.shields.io/badge/WhatsApp-%2B55%2011%2097428--9097-green?logo=whatsapp" />
  </a>
</p>

> AMZX is a premium, open-source, high-performance [blockchain protocol](https://better2better.com.br). <br/> 
You can use it to build your own decentralized networks and applications. AMZX provides a complete blockchain ecosystem, including a smart contract language called RIDE and the native **AMZX** asset.

---

## ✨ Features of AMZX Node

An AMZX node is a host connected to the private/public blockchain network with the following core functions:

- **Processing & Validation** of [AMZX Transactions](https://better2better.com.br/blockchain/transaction/transaction-validation)
- **Generation & Storage** of block headers and state histories
- **Network P2P Communication** with other peer nodes in the ecosystem
- **Full REST API** for wallets, keys, and balance query management
- **Dynamic gRPC extensions** for integration with external dex and matcher services

---

## 🚀 Getting Started

Here is a quick setup guide to get your AMZX private node compiled and running.

### Prerequisites
- **Java 17 (OpenJDK 17)**
- **SBT (Scala Build Tool)**

### Linux (Ubuntu/Debian) Environment Setup:
```bash
sudo apt-get update
sudo apt-get install openjdk-17-jdk -y
```

### 1. Clone the Repository
```bash
git clone https://github.com/D-H-O-R-A/amzx.git
cd amzx
```

### 2. Compile and Assemble the Fat JAR
Compile the entire Scala project and package it as a fat single runnable JAR:
```bash
sbt node/assembly
```
The resulting fat JAR will be located at:
`node/target/waves-all-1.6.3-DIRTY.jar` (retains core package dependencies securely).

### 3. Run Your Private AMZX Blockchain
You can run the node by supplying a custom configuration file:
```bash
java \
  --add-opens=java.base/sun.nio.ch=ALL-UNNAMED \
  --add-opens=java.base/java.util.concurrent.atomic=ALL-UNNAMED \
  -jar node/target/waves-all-1.6.3-DIRTY.jar path/to/config/amzx.conf
```

---

## 🔧 Interactive Network Wizard

For an automated, step-by-step private network creation (with custom chainId, initial balance/supply, and ports), use the pre-packaged setup tool:

```bash
cd amz-network-wizard
./init-network.sh
```

### Resetting Matcher DEX & FullExplorer (Without Wiping Blockchain)
If your blockchain is already running and you need to redefine the Matcher seed, reset the Matcher DEX orderbook state, and force FullExplorer to re-index from Block 1 **without touching or wiping the running blockchain node**, run:

```bash
cd amz-network-wizard
./reset-matcher-explorer.sh
```

---

## 🤝 Node & Validator Onboarding Wizard (join-network.sh)

For new operators and community members wishing to join an existing AMZX blockchain network as a **Validator (Mining / Staking PoS)** or a **Full Syncing Node (API / Peer)**, use the onboarding wizard:

```bash
# Run from the project root:
./join-network.sh

# Or from inside amz-network-wizard:
cd amz-network-wizard
./join-network.sh
```

### 🛡️ Security & Genesis Flexibility:
- **Role Selection:** Choose between **Validator / PoS Miner** (`miner.enable = yes`) or **Full Node / Sync Peer** (`miner.enable = no`).
- **Encrypted Wallet Storage (`wallet.dat`):** Keys and seed phrases are stored inside a secured `.dat` file encrypted via **PBKDF2 (999,999 iterations) + AES-128**. The node requires the wallet password to decrypt the keystore on startup.
- **Flexible Genesis Input:** Accepts raw pasted Genesis Block JSON (with `transactions`, `nxt-consensus`, `signatures`), `genesis.json` files, or existing `blockchain.conf` configs. Automatically extracts the **Chain ID** and consensus settings.
- **Pre-flight Balance Verification:** Queries the candidate address on the specified validator node before starting. Informs the operator if the account meets the **1,000 coin minimum generating balance** required for active block forging.
- **Isolated Run Directory:** Provisions an independent `run-node-[CHAIN_ID]` / `run-validator-[CHAIN_ID]` folder with dedicated `start-node.sh` and `stop-node.sh` scripts, fully compatible with `amzx-doctor.sh`.

---

## 🩺 AMZX Network Doctor & Auto-Healer

The **AMZX Doctor** (`./amzx-doctor.sh`) is an automated diagnostic, audit, and self-healing tool created exclusively for the AMZX Blockchain Network.

### 🛡️ Features & Auto-Recovery:
- **Port 80 Conflict Resolver:** Detects and automatically disables Apache2 if it starts up during server reboots, ensuring Nginx has sole control over port 80.
- **Nginx Reverse Proxy Restorer:** Validates Nginx syntax, cleans duplicate vhost configs, and restarts the Nginx web server if it entered a failed state.
- **Blockchain Node Auto-Heal:** Detects if the AMZX Node (`start-node.sh` on port 6869) stopped and resumes block mining and validation from the current block height **without wiping or altering any LevelDB data**.
- **Matcher DEX Auto-Heal:** Checks REST port 6886 and restarts Matcher DEX if needed without losing orderbook state.
- **Data Service & PostgreSQL Check:** Verifies the PostgreSQL database (port 5432), Data Service API (port 3000), and Docker sync containers.
- **Real-Time HTTPS Endpoints Testing:** Runs live status health-checks on public subdomains (`nodes.*`, `matcher.*`, `rpc.*`, `data-service.*`).

### 🚀 Usage:
```bash
# Run the AMZX Network Doctor from the project root:
./amzx-doctor.sh

# Or from inside amz-network-wizard:
cd amz-network-wizard
./amzx-doctor.sh
```

---

## 🔄 Guia de Atualização de Versão (Sem Perda de Dados)

Se você já possui um nó ou validador em execução e deseja atualizar o software do AMZX para uma nova versão sem perder o histórico de blocos, saldo ou dados:

Consulte o nosso guia completo passo a passo:
👉 **[📘 Manual de Atualização do AMZX Node & Validadores](./MANUAL_ATUALIZACAO_NODE.md)**

O manual abrange:
- **Preservação de Dados:** Garantia de persistência total do banco de dados (LevelDB / RocksDB) em `data/`.
- **Proteção Contra Reboot de VPS (Hostinger / Cloud):** Inicialização automática em segundo plano via systemd com `./setup-autostart.sh` (com `Restart=always`).
- **Nó via Script / Nohup:** Como parar graciosa e seguramente, substituir o JAR e reiniciar continuando no mesmo bloco.
- **Instalação via Pacote Debian / Ubuntu (`.deb` / APT):** Atualização via comando `dpkg` sem sobrescrever `/var/lib/waves/data`.
- **Ambientes Docker:** Atualização de imagem com mapeamento de volumes persistentes.
- **Execução em Windows & macOS:** Como atualizar o binário no notebook/PC sem afetar sua pasta de dados.
- **Estratégia Rolling Update:** Passo a passo para atualizar redes de múltiplos validadores com zero downtime.

---

## 🦊 Web3, MetaMask & EVM JSON-RPC Layer (HTTP & WSS)

AMZX features a high-performance EVM compatibility proxy layer allowing **MetaMask**, **Trust Wallet**, **SafePal**, **Web3.js**, **Ethers.js**, and dApps to interact directly with the AMZX blockchain over HTTP and WebSocket (`ws://` / `wss://`).

### 🌐 Network Configuration (MetaMask / Web3):
- **Network Name:** AMZX Network
- **RPC URL:** `https://rpc.<your-domain>/` (or `http://127.0.0.1:6869/eth/`)
- **WebSocket URL:** `wss://rpc.<your-domain>/` (or `ws://127.0.0.1:6869/eth/`)
- **Chain ID:** Configured network chainId (e.g., `84` or custom)
- **Currency Symbol:** `AMZX`

### 💎 Key EVM & Web3 Capabilities:
- **WebSocket PubSub (`eth_subscribe` / `eth_unsubscribe`):** Live event streaming for `newHeads`, transaction confirmations, and state updates.
- **EIP-1559 Fee Market:** Full gas estimation with `eth_feeHistory`, `eth_maxPriorityFeePerGas`, `eth_gasPrice`, and `eth_estimateGas`.
- **JSON-RPC Batching:** Simultaneous multi-call support for extensions and client libraries.
- **Full ERC-20 Support:** Instant balance, token symbol, name, and decimals detection via `eth_call` (`name`, `symbol`, `decimals`, `totalSupply`, `balanceOf`, `allowance`). Emits standard `Transfer(from, to, value)` receipt logs.
- **Virtual ERC-721 NFT Support:** Automatic NFT detection via EIP-165 `supportsInterface(0x80ac58cd)`. Surfaces metadata URLs via `tokenURI(tokenId)` pointing directly to the asset's IPFS/HTTPS description, alongside `ownerOf()`, `name()`, `symbol()`, and `balanceOf()`.
- **Native State Storage (`eth_getStorageAt`):** Maps EVM slot indexing and string key queries directly to the AMZX account data storage (`accountData`), outputting 32-byte hex values.
- **Cryptographic & Utility Methods:** `web3_clientVersion`, `net_version`, `net_listening`, `net_peerCount`, `web3_sha3`, `personal_ecRecover`, and `eth_getLogs`.
- **ChainID-Bound Address Resolution:** Validates and binds 20-byte EVM addresses with the active network `chainId` and checksum for 100% interoperability with native AMZX Base58 addresses.

---

## 🗺️ Roadmap & Inovações Futuras (Upcoming Features)

O ecossistema AMZX está em constante evolução tecnológica, combinando o melhor da solidez e descentralização com a experiência fluida dos maiores ecossistemas do mercado:

- **🔌 Retrocompatibilidade Web3.js & Conexão MetaMask Nativa (Já Disponível):**
  - Conexão direta e sem fricção com MetaMask, Trust Wallet, SafePal, Ethers.js e Web3.js.
  - Suporte completo a HTTP e WebSocket (`ws://` / `wss://`), taxas EIP-1559, chamadas em lote (batching), tokens ERC-20, detecção nativa de NFTs ERC-721 e leitura de storage.

- **🕵️ Transações com Privacidade Estilo Monero / Zcash (Em Breve):**
  - Implementação de transações blindadas (Shielded Transactions) com provas de conhecimento zero (ZK-SNARKs / Bulletproofs), assinaturas em anel (Ring Signatures) e endereços furtivos (Stealth Addresses), garantindo anonimato opcional e confidencialidade absoluta para saldos e transferências.

- **⚡ Layer 2 (L2) Ultra Veloz Estilo Solana (Em Breve):**
  - Desenvolvimento de uma camada L2 dedicada para processamento de dezenas de milhares de transações por segundo (TPS), com finalidade sub-segundo e taxas insignificantes, ideal para microtransações, dApps de alta frequência, GameFi e pagamentos instantâneos.

---

## 👨‍💻 Developer & Support Contacts

For inquiries, support, integration consulting, or commercial collaborations, reach out to the project developer:

- **Developer:** [Diego Oris](https://diegooris.ch)
- **Email:** [diegoantunes2301@gmail.com](mailto:diegoantunes2301@gmail.com)
- **WhatsApp:** [+55 (11) 97428-9097](https://wa.me/5511974289097)
- **GitHub Repository:** [https://github.com/D-H-O-R-A/amzx](https://github.com/D-H-O-R-A/amzx)

---

## 📝 License

The code in this project is licensed under the [MIT License](./LICENSE).
