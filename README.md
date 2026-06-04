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
