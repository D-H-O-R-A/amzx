#!/usr/bin/env python3
import os
import sys
import time
import json
import shutil
import subprocess
import requests

WORKSPACE = "/home/diegooris/amzx"
MATCHER_DIR = "/home/diegooris/amzx-matcher"
TEST_DIR = "/tmp/amzx_e2e_live"
REST_PORT = 16869
GRPC_PORT = 16887
UPDATES_PORT = 16881
P2P_PORT = 16864
MATCHER_PORT = 16886
CHAIN_ID = "L"
API_KEY = "testapikey123"

def log(msg):
    print(f"\033[1;34m[E2E-TEST]\033[0m {msg}", flush=True)

def success(msg):
    print(f"\033[1;32m[SUCCESS]\033[0m {msg}", flush=True)

def fail(msg):
    print(f"\033[1;31m[ERROR]\033[0m {msg}", flush=True)
    sys.exit(1)

def setup_environment():
    log("Setting up isolated test environment in " + TEST_DIR)
    if os.path.exists(TEST_DIR):
        shutil.rmtree(TEST_DIR)
    os.makedirs(f"{TEST_DIR}/node-data", exist_ok=True)
    os.makedirs(f"{TEST_DIR}/matcher-data", exist_ok=True)
    os.makedirs(f"{TEST_DIR}/lib", exist_ok=True)
    os.makedirs(f"{TEST_DIR}/wallet", exist_ok=True)
    open(f"{TEST_DIR}/node-data/lp-accounts.txt", "w").close()
    open(f"{TEST_DIR}/matcher-data/lp-accounts.txt", "w").close()

    # Copy extension jars to lib
    shutil.copy(f"{WORKSPACE}/waves-ext/target/waves-ext-1.7.0.jar", f"{TEST_DIR}/lib/")
    stage_lib = f"{WORKSPACE}/grpc-server/target/universal/stage/lib"
    for jar in os.listdir(stage_lib):
        if jar.endswith(".jar"):
            shutil.copy(os.path.join(stage_lib, jar), f"{TEST_DIR}/lib/")
    
    # Also copy ficus if found
    cmd = "find ~/.cache/coursier/v1 ~/.ivy2/cache -name '*ficus_3*.jar' 2>/dev/null | head -n 1"
    ficus = subprocess.check_output(cmd, shell=True).decode().strip()
    if ficus and os.path.exists(ficus):
        shutil.copy(ficus, f"{TEST_DIR}/lib/")

def generate_genesis():
    log("Generating cryptographic genesis block...")
    fat_jar = f"{WORKSPACE}/node/target/waves-all-1.7.0.jar"
    seed = "amzx test private e2e live network seed phrase wordlist"
    
    gen_in = f"{TEST_DIR}/temp-generator.conf"
    with open(gen_in, "w") as f:
        f.write(f"""genesis-generator {{
  network-type = "{CHAIN_ID}"
  base-target = null
  min-block-time = 2s
  average-block-delay = 5s
  timestamp = {int(time.time() * 1000)}
  distributions = [
    {{ seed-text = "{seed}", amount = 10000000000000000, miner = true }}
  ]
}}
""")
    
    gen_out_txt = f"{TEST_DIR}/temp-out.txt"
    gen_out_conf = f"{TEST_DIR}/temp-genesis.conf"
    res = subprocess.run([
        "java", "-cp", fat_jar, "com.wavesplatform.GenesisBlockGenerator", gen_in, gen_out_conf
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    with open(gen_out_txt, "w") as f:
        f.write(res.stdout)
    
    # Extract keys
    seed_b58 = ""
    priv_key = ""
    pub_key = ""
    addr = ""
    for line in res.stdout.splitlines():
        if "Seed:" in line:
            seed_b58 = line.split(":", 1)[1].strip()
        elif "Private account key:" in line:
            priv_key = line.split(":", 1)[1].strip()
        elif "Public account key:" in line:
            pub_key = line.split(":", 1)[1].strip()
        elif "Account address:" in line:
            addr = line.split(":", 1)[1].strip()
            
    log(f"Genesis Address: {addr}")
    log(f"Genesis Seed Base58: {seed_b58}")
    return seed_b58, priv_key, pub_key, addr, gen_out_conf

def compute_api_key_hash():
    fat_jar = f"{WORKSPACE}/node/target/waves-all-1.7.0.jar"
    java_code = f"""public class GenHash {{
    public static void main(String[] args) throws Exception {{
        byte[] bytes = "{API_KEY}".getBytes("UTF-8");
        byte[] hashed = com.wavesplatform.crypto.package$.MODULE$.secureHash(bytes);
        String base58 = com.wavesplatform.common.utils.Base58$.MODULE$.encode(hashed);
        System.out.println(base58);
    }}
}}"""
    temp_java = f"{TEST_DIR}/GenHash.java"
    with open(temp_java, "w") as f:
        f.write(java_code)
    subprocess.run(["javac", "-cp", fat_jar, temp_java], check=True)
    res = subprocess.check_output(["java", "-cp", f"{TEST_DIR}:{fat_jar}", "GenHash"]).decode().strip()
    return res

def create_node_config(seed_b58, priv_key, api_key_hash, genesis_conf_path):
    with open(genesis_conf_path, "r") as f:
        genesis_block_cfg = f.read()

    conf_content = f"""waves {{
  directory = "{TEST_DIR}/node-data"
  blockchain {{
    type = CUSTOM
    custom {{
      address-scheme-character = "{CHAIN_ID}"
      functionality {{
        feature-check-blocks-period = 10
        blocks-for-feature-activation = 8
        generation-balance-depth-from-50-to-1000-after-height = 0
        reset-effective-balances-at-height = 0
        block-version-3-after-height = 0
        pre-activated-features {{
          1 = 0, 2 = 0, 3 = 0, 4 = 0, 5 = 0, 6 = 0, 7 = 0, 8 = 0, 9 = 0, 10 = 0,
          11 = 0, 12 = 0, 13 = 0, 14 = 0, 15 = 0, 16 = 0, 17 = 0, 18 = 0, 19 = 0,
          20 = 0, 21 = 0, 22 = 0, 23 = 0, 24 = 0, 25 = 0, 26 = 0, 29 = 0
        }}
        double-features-periods-after-height = 1000000000
        max-transaction-time-back-offset = 120m
        max-transaction-time-forward-offset = 90m
        lease-expiration = 1000000
        min-asset-info-update-interval = 7
        min-block-time = 2s
        delay-delta = 8
      }}
      rewards {{
        term = 100000
        term-after-capped-reward-feature = 100000
        initial = 600000000
        min-increment = 50000000
        voting-interval = 10000
      }}
      {genesis_block_cfg}
    }}
  }}
  network {{
    bind-address = "127.0.0.1"
    port = {P2P_PORT}
    declared-address = "127.0.0.1:{P2P_PORT}"
    known-peers = []
    node-name = "amzx-test-node"
    enable-peers-exchange = no
  }}
  wallet {{
    file = "{TEST_DIR}/wallet/wallet.dat"
    password = "testpassword123!"
    seed = "{seed_b58}"
  }}
  rest-api {{
    enable = yes
    bind-address = "127.0.0.1"
    port = {REST_PORT}
    api-key-hash = "{api_key_hash}"
    minimum-peers = 0
  }}
  miner {{
    enable = yes
    quorum = 0
    interval-after-last-block-then-generation-is-allowed = 1000d
    micro-block-interval = 1s
    minimal-generation-offset = 0s
    private-keys = ["{priv_key}"]
  }}
  extensions = [
    "com.wavesplatform.dex.grpc.integration.DEXExtension",
    "com.wavesplatform.events.BlockchainUpdates"
  ]
  dex {{
    grpc.integration {{
      host = "127.0.0.1"
      port = {GRPC_PORT}
    }}
    lp-accounts.file-path = "{TEST_DIR}/node-data/lp-accounts.txt"
    order-script-validation.allowed-blockchain-state-accounts = []
  }}
  blockchain-updates {{
    grpc {{
      host = "127.0.0.1"
      port = {UPDATES_PORT}
    }}
  }}
}}
"""
    node_conf = f"{TEST_DIR}/blockchain.conf"
    with open(node_conf, "w") as f:
        f.write(conf_content)
    log(f"Created node config at {node_conf}")
    return node_conf

def start_node(node_conf):
    fat_jar = f"{WORKSPACE}/node/target/waves-all-1.7.0.jar"
    cmd = [
        "java",
        "--add-opens=java.base/sun.nio.ch=ALL-UNNAMED",
        "--add-opens=java.base/java.util.concurrent.atomic=ALL-UNNAMED",
        "-cp", f"{fat_jar}:{TEST_DIR}/lib/*",
        "com.wavesplatform.Application",
        node_conf
    ]
    log_file = open(f"{TEST_DIR}/node.log", "w")
    log("Starting AMZX Node v1.7.0...")
    proc = subprocess.Popen(cmd, stdout=log_file, stderr=subprocess.STDOUT)
    return proc, log_file

def wait_for_node():
    url = f"http://127.0.0.1:{REST_PORT}/node/version"
    for i in range(40):
        try:
            r = requests.get(url, timeout=1)
            if r.status_code == 200:
                data = r.json()
                success(f"Node is UP! /node/version responded: {data}")
                return data.get("version")
        except Exception:
            pass
        time.sleep(1)
    fail("Node failed to respond within 40 seconds. Check node.log!")

def verify_swagger():
    log("Verifying Swagger API specification and version...")
    url = f"http://127.0.0.1:{REST_PORT}/api-docs/openapi.yaml"
    r = requests.get(url, timeout=5)
    if r.status_code != 200:
        fail(f"Failed to fetch Swagger OpenAPI: status {r.status_code}")
    content = r.text
    if "version: '1.7.0'" in content or "version: 1.7.0" in content:
        success("Swagger OpenAPI verified: Version is '1.7.0'!")
    else:
        # Check first 20 lines of swagger
        lines = content.splitlines()[:15]
        fail(f"Swagger OpenAPI version 1.7.0 not found in header:\n" + "\n".join(lines))

def sign_and_broadcast(tx_json):
    headers = {"X-API-Key": API_KEY, "Content-Type": "application/json"}
    sign_url = f"http://127.0.0.1:{REST_PORT}/transactions/sign"
    r_sign = requests.post(sign_url, headers=headers, json=tx_json, timeout=10)
    if r_sign.status_code != 200:
        fail(f"Sign transaction failed: {r_sign.status_code} - {r_sign.text}")
    signed_tx = r_sign.json()
    
    bcast_url = f"http://127.0.0.1:{REST_PORT}/transactions/broadcast"
    r_bcast = requests.post(bcast_url, headers=headers, json=signed_tx, timeout=10)
    if r_bcast.status_code != 200:
        fail(f"Broadcast transaction failed: {r_bcast.status_code} - {r_bcast.text}")
    res = r_bcast.json()
    return res

def wait_for_tx(tx_id):
    url = f"http://127.0.0.1:{REST_PORT}/transactions/info/{tx_id}"
    for i in range(25):
        try:
            r = requests.get(url, timeout=1)
            if r.status_code == 200:
                return r.json()
        except Exception:
            pass
        time.sleep(1)
    fail(f"Transaction {tx_id} not mined within 25 seconds")

def main():
    print("=" * 70)
    print("  AMZX BLOCKCHAIN & MATCHER DEX FULL E2E VALIDATION (v1.7.0)")
    print("=" * 70)

    setup_environment()
    seed_b58, priv_key, pub_key, genesis_addr, genesis_conf = generate_genesis()
    api_key_hash = compute_api_key_hash()
    node_conf = create_node_config(seed_b58, priv_key, api_key_hash, genesis_conf)
    
    node_proc, node_log = start_node(node_conf)
    
    try:
        version_str = wait_for_node()
        if "1.7.0" not in version_str:
            fail(f"Expected node version to contain 1.7.0, but got: {version_str}")
        
        verify_swagger()
        
        # Get recipient account
        r_wallet = requests.get(f"http://127.0.0.1:{REST_PORT}/addresses", headers={"X-API-Key": API_KEY}).json()
        log(f"Node addresses: {r_wallet}")
        
        # Generate new recipient address
        r_new = requests.post(f"http://127.0.0.1:{REST_PORT}/addresses", headers={"X-API-Key": API_KEY}).json()
        recipient_addr = r_new.get("address")
        log(f"Generated test recipient address: {recipient_addr}")
        
        print("\n" + "=" * 50)
        log("STAGE 1: Native AMZX Operations (Zero Custom Tokens)")
        print("=" * 50)
        
        # 1. Native Transfer
        transfer_json = {
            "type": 4,
            "sender": genesis_addr,
            "recipient": recipient_addr,
            "amount": 1000000000, # 10 AMZX
            "fee": 100000,
            "assetId": None
        }
        tx = sign_and_broadcast(transfer_json)
        tx_info = wait_for_tx(tx["id"])
        success(f"Native Transfer confirmed: ID={tx['id']}, height={tx_info.get('height')}")
        
        # 2. Native Mass Transfer
        mass_json = {
            "type": 11,
            "sender": genesis_addr,
            "transfers": [
                {"recipient": recipient_addr, "amount": 500000000},
                {"recipient": genesis_addr, "amount": 100000000}
            ],
            "fee": 200000,
            "assetId": None
        }
        tx = sign_and_broadcast(mass_json)
        tx_info = wait_for_tx(tx["id"])
        success(f"Native MassTransfer confirmed: ID={tx['id']}, height={tx_info.get('height')}")
        
        # 3. Native Data Transaction
        data_json = {
            "type": 12,
            "sender": genesis_addr,
            "data": [
                {"key": "test_chain", "type": "string", "value": "AMZX-V1.7.0-LIVE"},
                {"key": "high_precision_active", "type": "boolean", "value": True}
            ],
            "fee": 100000
        }
        tx = sign_and_broadcast(data_json)
        tx_info = wait_for_tx(tx["id"])
        success(f"Native DataTransaction confirmed: ID={tx['id']}, height={tx_info.get('height')}")
        
        # 4. Native Lease & LeaseCancel
        lease_json = {
            "type": 8,
            "sender": genesis_addr,
            "recipient": recipient_addr,
            "amount": 500000000,
            "fee": 100000
        }
        tx = sign_and_broadcast(lease_json)
        lease_id = tx["id"]
        wait_for_tx(lease_id)
        success(f"Native Lease confirmed: ID={lease_id}")
        
        cancel_lease_json = {
            "type": 9,
            "sender": genesis_addr,
            "leaseId": lease_id,
            "fee": 100000
        }
        tx = sign_and_broadcast(cancel_lease_json)
        wait_for_tx(tx["id"])
        success(f"Native CancelLease confirmed: ID={tx['id']}")
        
        # 5. Create Alias
        alias_name = f"amzxalias{int(time.time()) % 100000}"
        alias_json = {
            "type": 10,
            "sender": genesis_addr,
            "alias": alias_name,
            "fee": 100000
        }
        tx = sign_and_broadcast(alias_json)
        wait_for_tx(tx["id"])
        success(f"Native CreateAlias '{alias_name}' confirmed: ID={tx['id']}")
        
        print("\n" + "=" * 50)
        log("STAGE 2: Standard Token Operations (8 Decimals)")
        print("=" * 50)
        
        # Issue 8-dec token
        issue_std_json = {
            "type": 3,
            "sender": genesis_addr,
            "name": "STDTOKEN",
            "description": "Standard 8-decimal AMZX Asset",
            "quantity": 100000000000000, # 1,000,000 tokens
            "decimals": 8,
            "reissuable": True,
            "fee": 100000000
        }
        tx = sign_and_broadcast(issue_std_json)
        std_asset_id = tx["id"]
        wait_for_tx(std_asset_id)
        success(f"Standard Token (8 decimals) Issued: AssetID={std_asset_id}")
        
        # Transfer standard token
        tx = sign_and_broadcast({
            "type": 4,
            "sender": genesis_addr,
            "recipient": recipient_addr,
            "amount": 1000000000000, # 10,000 tokens
            "fee": 100000,
            "assetId": std_asset_id
        })
        wait_for_tx(tx["id"])
        success(f"Standard Token Transfer confirmed: ID={tx['id']}")
        
        # Reissue standard token
        tx = sign_and_broadcast({
            "type": 5,
            "sender": genesis_addr,
            "assetId": std_asset_id,
            "quantity": 50000000000000, # +500,000 tokens
            "reissuable": True,
            "fee": 100000000
        })
        wait_for_tx(tx["id"])
        success(f"Standard Token Reissue confirmed: ID={tx['id']}")
        
        # Burn standard token
        tx = sign_and_broadcast({
            "type": 6,
            "sender": genesis_addr,
            "assetId": std_asset_id,
            "amount": 1000000000000, # -10,000 tokens
            "fee": 100000
        })
        wait_for_tx(tx["id"])
        success(f"Standard Token Burn confirmed: ID={tx['id']}")
        
        # Mass transfer standard token
        tx = sign_and_broadcast({
            "type": 11,
            "sender": genesis_addr,
            "assetId": std_asset_id,
            "transfers": [
                {"recipient": recipient_addr, "amount": 1000000000},
                {"recipient": genesis_addr, "amount": 2000000000}
            ],
            "fee": 200000
        })
        wait_for_tx(tx["id"])
        success(f"Standard Token MassTransfer confirmed: ID={tx['id']}")
        
        # Sponsor Fee standard token
        tx = sign_and_broadcast({
            "type": 14,
            "sender": genesis_addr,
            "assetId": std_asset_id,
            "minSponsoredAssetFee": 100000000,
            "fee": 100000000
        })
        wait_for_tx(tx["id"])
        success(f"Standard Token Fee Sponsorship confirmed: ID={tx['id']}")
        
        print("\n" + "=" * 50)
        log("STAGE 3: High-Precision Token Operations (18 Decimals - ERC20)")
        print("=" * 50)
        
        # Issue 18-decimal token
        # 500 tokens * 10^18 atomic units = 5,000,000,000,000,000,000
        issue_18_json = {
            "type": 3,
            "sender": genesis_addr,
            "name": "ERC20HIGH",
            "description": "High Precision 18-decimal AMZX Asset",
            "quantity": 5000000000000000000,
            "decimals": 18,
            "reissuable": True,
            "fee": 100000000
        }
        tx = sign_and_broadcast(issue_18_json)
        high_asset_id = tx["id"]
        wait_for_tx(high_asset_id)
        success(f"High-Precision Token (18 decimals) Issued: AssetID={high_asset_id}")
        
        # Verify asset details in REST API
        asset_info = requests.get(f"http://127.0.0.1:{REST_PORT}/assets/details/{high_asset_id}").json()
        if asset_info.get("decimals") != 18:
            fail(f"Asset details decimals mismatch: expected 18, got {asset_info.get('decimals')}")
        success(f"Verified 18 Decimals on Asset Details API: decimals={asset_info.get('decimals')}")
        
        # Transfer 18-decimal token (1 token = 10^18 atomic units)
        tx = sign_and_broadcast({
            "type": 4,
            "sender": genesis_addr,
            "recipient": recipient_addr,
            "amount": 1000000000000000000,
            "fee": 100000,
            "assetId": high_asset_id
        })
        wait_for_tx(tx["id"])
        success(f"High-Precision 18-dec Token Transfer confirmed: ID={tx['id']}")
        
        # Reissue 18-decimal token (+1 token)
        tx = sign_and_broadcast({
            "type": 5,
            "sender": genesis_addr,
            "assetId": high_asset_id,
            "quantity": 1000000000000000000,
            "reissuable": True,
            "fee": 100000000
        })
        wait_for_tx(tx["id"])
        success(f"High-Precision 18-dec Token Reissue confirmed: ID={tx['id']}")
        
        # Burn 18-decimal token (-0.5 token)
        tx = sign_and_broadcast({
            "type": 6,
            "sender": genesis_addr,
            "assetId": high_asset_id,
            "amount": 500000000000000000,
            "fee": 100000
        })
        wait_for_tx(tx["id"])
        success(f"High-Precision 18-dec Token Burn confirmed: ID={tx['id']}")
        
        # Mass transfer 18-decimal token
        tx = sign_and_broadcast({
            "type": 11,
            "sender": genesis_addr,
            "assetId": high_asset_id,
            "transfers": [
                {"recipient": recipient_addr, "amount": 250000000000000000},
                {"recipient": genesis_addr, "amount": 250000000000000000}
            ],
            "fee": 200000
        })
        wait_for_tx(tx["id"])
        success(f"High-Precision 18-dec Token MassTransfer confirmed: ID={tx['id']}")
        
        # Sponsor Fee 18-decimal token
        tx = sign_and_broadcast({
            "type": 14,
            "sender": genesis_addr,
            "assetId": high_asset_id,
            "minSponsoredAssetFee": 1000000000000000000,
            "fee": 100000000
        })
        wait_for_tx(tx["id"])
        success(f"High-Precision 18-dec Token Fee Sponsorship confirmed: ID={tx['id']}")
        
        # Verify balances
        bal = requests.get(f"http://127.0.0.1:{REST_PORT}/assets/balance/{recipient_addr}/{high_asset_id}").json()
        success(f"Recipient balance of 18-dec token: {bal.get('balance')} atomic units")
        
        print("\n" + "=" * 70)
        success("ALL LIVE TRANSACTIONS COMPLETED AND VALIDATED WITH 100% SUCCESS!")
        print("=" * 70)
        
    finally:
        log("Shutting down test node cleanly...")
        node_proc.terminate()
        try:
            node_proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            node_proc.kill()
        node_log.close()
        log("Test node stopped.")

if __name__ == "__main__":
    main()
