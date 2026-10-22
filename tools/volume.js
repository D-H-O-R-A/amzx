#!/usr/bin/env node
/**
 * Gerador de volume de transferências em árvore (escala de milhões).
 *
 * Uso: node volume.js <funderSeed> <amount> [nodeUrl] [chainId]
 *        [--dry-run] [--fee=0.001] [--max-depth=N] [--concurrency=50] [--max-txs=N]
 *
 * Fluxo:
 *  1. Cria um endereço raiz e envia <amount> da seed financiadora.
 *  2. Cada endereço cria 2 filhos, repassa 90% (divisão aleatória) e mantém ~10%.
 *  3. Um nó vira folha quando o valor a repassar é <= taxa (ou não sobra p/ as taxas).
 *
 * Escala: fila com N workers (--concurrency), sem esperar nível inteiro,
 * log em streaming (volume-<runId>.jsonl) e retry em falhas de rede.
 * Seeds dos filhos: `${funderSeed}:volume:${runId}:${caminho}` (recuperável).
 */
const wt = require('@waves/waves-transactions');
const fs = require('fs');

const args = process.argv.slice(2);
const flags = args.filter(a => a.startsWith('--'));
const pos = args.filter(a => !a.startsWith('--'));
const flag = (n, d) => (flags.find(f => f.startsWith(`--${n}=`)) || `--${n}=${d}`).split('=')[1];
const [funderSeed, amountStr, nodeUrl = 'https://nodes.planetone.io', chainId = 'P'] = pos;
const dryRun = flags.includes('--dry-run');
const DEC = 1e8;
const FEE = Math.round(parseFloat(flag('fee', '0.001')) * DEC);
const MAX_DEPTH = parseInt(flag('max-depth', 1000), 10);
const CONCURRENCY = parseInt(flag('concurrency', 50), 10);
const MAX_TXS = parseInt(flag('max-txs', Number.MAX_SAFE_INTEGER), 10);
const KEEP = 0.10;

if (!funderSeed || !amountStr) {
  console.error('Uso: node volume.js <funderSeed> <amount> [nodeUrl] [chainId] [--dry-run] [--fee=0.001] [--max-depth=N] [--concurrency=50] [--max-txs=N]');
  process.exit(1);
}
const AMOUNT = Math.round(parseFloat(amountStr) * DEC);
const runId = Date.now().toString(36);
const fmt = v => (v / DEC).toFixed(8);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const childSeed = path => `${funderSeed}:volume:${runId}:${path}`;
const addr = seed => wt.libs.crypto.address(seed, chainId);
const logStream = fs.createWriteStream(`volume-${runId}.jsonl`);
let txCount = 0, volume = 0, leaves = 0;

async function retry(fn, tries = 8) {
  for (let i = 0; ; i++) {
    try { return await fn(); }
    catch (e) { if (i >= tries) throw e; await sleep(1000 * (i + 1)); }
  }
}

async function balanceOf(address) {
  return retry(async () => {
    const r = await fetch(`${nodeUrl}/addresses/balance/${address}`);
    return (await r.json()).balance || 0;
  });
}

async function broadcast(tx) {
  await retry(async () => {
    const r = await fetch(`${nodeUrl}/transactions/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(tx),
    });
    const body = await r.json();
    // tx já conhecida pelo nó = sucesso em retry
    if (body.error && !/already in the state|already/i.test(body.message || '')) {
      throw new Error(JSON.stringify(body));
    }
  });
}

async function send(seed, recipient, amount) {
  const tx = wt.transfer({ recipient, amount, fee: FEE, chainId }, seed);
  if (!dryRun) await broadcast(tx);
  txCount++;
  volume += amount;
  logStream.write(JSON.stringify({ from: addr(seed), to: recipient, amount: fmt(amount), id: tx.id }) + '\n');
  if (txCount % 1000 === 0) {
    console.log(`txs: ${txCount} | folhas: ${leaves} | fila: ${queue.length} | volume ≈ ${fmt(volume)}`);
  }
  return tx;
}

async function waitBalance(address, min, tx) {
  if (dryRun) return;
  // espera até ~30 min, reenviando a tx a cada ~60s (caso tenha sido descartada do UTX)
  for (let i = 0; i < 900; i++) {
    if ((await balanceOf(address)) >= min) return;
    if (tx && i > 0 && i % 30 === 0) await broadcast(tx).catch(() => {});
    await sleep(2000);
  }
  throw new Error(`Timeout aguardando saldo em ${address}`);
}

function randomSplit(pool) {
  const a = Math.floor(pool * (0.3 + Math.random() * 0.4));
  return [a, pool - a];
}

const queue = [];
let active = 0;
let failed = 0;

async function processNode(node) {
  await waitBalance(addr(node.seed), node.balance, node.tx);
  if (node.depth >= MAX_DEPTH || txCount >= MAX_TXS) { leaves++; return; }
  const pool = Math.floor(node.balance * (1 - KEEP));
  const [a, b] = randomSplit(pool);
  if (a <= FEE || b <= FEE || node.balance - a - b < 2 * FEE) { leaves++; return; }
  for (const [i, amt] of [[0, a], [1, b]]) {
    const path = `${node.path}.${i}`;
    const seed = childSeed(path);
    const tx = await send(node.seed, addr(seed), amt);
    queue.push({ path, seed, balance: amt, depth: node.depth + 1, tx });
  }
}

async function worker() {
  while (true) {
    const node = queue.pop(); // DFS: mantém a fila pequena
    if (!node) {
      if (active === 0) return;
      await sleep(50);
      continue;
    }
    active++;
    try { await processNode(node); }
    catch (e) { failed++; console.error(`Falha em ${node.path}: ${e.message}`); }
    finally { active--; }
  }
}

async function main() {
  console.log(`Run ${runId} | node ${nodeUrl} | chain ${chainId} | fee ${fmt(FEE)} | conc ${CONCURRENCY} ${dryRun ? '| DRY-RUN' : ''}`);
  const rootSeed = childSeed('r');
  console.log(`Raiz: ${addr(rootSeed)} <- ${fmt(AMOUNT)}`);
  await send(funderSeed, addr(rootSeed), AMOUNT);
  queue.push({ path: 'r', seed: rootSeed, balance: AMOUNT, depth: 0 });
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  logStream.end();
  console.log(`Concluído: ${txCount} txs, ${leaves} folhas, ${failed} falhas, volume ≈ ${fmt(volume)}. Log: volume-${runId}.jsonl`);
}

main().catch(e => { console.error('Erro:', e.message); process.exit(1); });
