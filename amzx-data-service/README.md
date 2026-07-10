<h1 align="center">🔷 AMZX Data Service</h1>

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

> **⚠️ This service is currently in /v0. Breaking changes are coming in /v1 (also possible, but not likely, within /v0 releases). Please use with caution.**

The **AMZX Data Service** is a high-performance, lightweight API indexer aimed at retrieving historical data, transaction volumes, pair rates, and address activities quickly and conveniently from the **AMZX Blockchain**.

It indexes state changes from the private network via a PostgreSQL relational database stream, exposing unified REST endpoints for Client Apps, Wallets, and Block Explorers.

Visit `/docs` on your running instance for complete Swagger interactive documentation.

---

## 🏛️ Ecosystem Integration

Within the **AMZX Blockchain** stack, this service functions as the historical query layer:

```
[AMZX Node (Core)] ➔ (Streams gRPC) ➔ [PostgreSQL DB] ➔ [AMZX Data Service] ➔ [Clients & Explorer]
```

---

## ⚙️ Environment Variables & Configuration

The service uses the following environment variables. If you are running locally via the provided helper scripts, these will be automatically injected with sane defaults.

| Env Variable | Default | Required | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | `3000` | No | HTTP REST API service port. |
| `PGHOST` | `127.0.0.1` | Yes | Postgres database host address. |
| `PGPORT` | `5432` | No | Postgres port. |
| `PGDATABASE` | `amzx_db` | Yes | Postgres database name. |
| `PGUSER` | `postgres` | Yes | Postgres username. |
| `PGPASSWORD` | `postgres` | Yes | Postgres password. |
| `PGPOOLSIZE` | `20` | No | Postgres connection pool size per NodeJS process. |
| `LOG_LEVEL` | `info` | No | Log level `['info','warn','error']`. |
| `DEFAULT_MATCHER`| `2eEUvypDSivnzPiLrbYEW39SM8yMZ1aq4eJuiKfs4sEY` | Yes | Default Matcher public address (used for DEX orders). |
| `RATE_BASE_ASSET_ID`| `AMZX` | No | Base asset ID used for pair calculations (rebranded native coin). |
| `RATE_THRESHOLD_ASSET_ID`| `AMZX` | No | Minimum volume verification native token ticker. |

---

## 🚀 Installation and Execution

### Option A: The Individual Helper Script (Recommended Local)
If you have the node and matcher already running and just want to spin up the data service:
1. Return to the root folder of the project:
   ```bash
   cd ..
   ```
2. Execute the automated script:
   ```bash
   ./start-data-service.sh
   ```
   *This script handles dependency installation, compiles the TypeScript code, and boots up the API server in one single command.*

---

### Option B: Docker Compose (Recommended Production)
The service is fully containerized and integrated into the global Docker Compose workflow.
To launch the entire stack (Database, Node, Matcher and Data Service):
```bash
cd amzx-docker
docker compose up -d
```
To launch or restart **only** the data-service container:
```bash
docker compose up -d amzx-data-service
```

---

### Option C: Manual NodeJS Step-by-Step
If you prefer running commands manually from inside this directory:
1. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps --ignore-scripts
   ```
2. **Build TypeScript Sources**:
   ```bash
   npm run build
   ```
3. **Run Dev Environment**:
   ```bash
   npm run dev
   ```

---

## 🛡️ Production Recommendations & Reverse Proxy

- **Nginx & SSL Certbot**: It is highly recommended to set up Nginx as a reverse proxy in front of this API. If you use the `init-network.sh` wizard, it automatically sets up the reverse proxy on Nginx and generates SSL certificates with Certbot for the **`data-service.YOUR_DOMAIN.com`** subdomain.
- **Scaling**: Run several Node.js process instances behind a balancer (e.g. Nginx or PM2 clustering) to optimize CPU multicore utilization.
- **SQL Index Optimization**: Execute the SQL commands in `mainnet.sql` against your PostgreSQL database to optimize query and matching indexes, greatly increasing performance.

---

## 👨‍💻 Developer & Support Contacts

For inquiries, support, integration consulting, or commercial collaborations, reach out to the project developer:

- **Developer:** Diego Antunes
- **Email:** [diegoantunes2301@gmail.com](mailto:diegoantunes2301@gmail.com)
- **WhatsApp:** [+55 (11) 97428-9097](https://wa.me/5511974289097)
- **GitHub Repository:** [https://github.com/D-H-O-R-A/amzx](https://github.com/D-H-O-R-A/amzx)

---

## 📝 License

This project is licensed under the [MIT License](./LICENSE) - see the file for details.
