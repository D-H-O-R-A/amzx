# 🧙‍♂️ AMZX Network Wizard & DEX/Explorer Management Utilities

This folder contains the orchestration and management scripts for deploying, resetting, and re-indexing the AMZX private blockchain network components.

---

## 📜 Available Scripts

### 1. `init-network.sh`
The primary full network setup wizard.
- **Function:** Initializes a new private blockchain, generates custom Genesis block configuration, constructs `blockchain.conf` and `matcher.conf`, and builds startup orchestration wrappers.
- **Usage:**
  ```bash
  ./init-network.sh
  ```

---

### 2. `reset-matcher-explorer.sh`
The targeted reset utility for Matcher DEX & FullExplorer.
- **Function:**
  - Safely stops Matcher DEX and FullExplorer indexers.
  - Leaves the core Blockchain Node database **100% untouched and running**.
  - Redefines/encodes the Matcher Seed into Base64 (using either the Genesis Seed from `blockchain.conf` or a custom supplied phrase).
  - Clears Matcher LevelDB state and FullExplorer SQLite database tables.
  - Restarts Matcher DEX and FullExplorer services to re-index all blocks starting from Block Height 1.
- **Usage:**
  ```bash
  # Option A: Automatically reuse and encode Genesis Seed from active blockchain.conf
  ./reset-matcher-explorer.sh

  # Option B: Pass a custom seed phrase as an argument
  ./reset-matcher-explorer.sh "your custom seed phrase here"
  ```

---

## 👨‍💻 Contacts & Support
- **Developer:** Diego Antunes (diegoantunes2301@gmail.com)
- **WhatsApp:** +55 (11) 97428-9097
- **GitHub:** https://github.com/D-H-O-R-A
