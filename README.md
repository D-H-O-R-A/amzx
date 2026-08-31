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

## 👨‍💻 Developer & Support Contacts

For inquiries, support, integration consulting, or commercial collaborations, reach out to the project developer:

- **Developer:** Diego Antunes
- **Email:** [diegoantunes2301@gmail.com](mailto:diegoantunes2301@gmail.com)
- **WhatsApp:** [+55 (11) 97428-9097](https://wa.me/5511974289097)
- **GitHub Repository:** [https://github.com/D-H-O-R-A/amzx](https://github.com/D-H-O-R-A/amzx)

---

## 📝 License

The code in this project is licensed under the [MIT License](./LICENSE).
