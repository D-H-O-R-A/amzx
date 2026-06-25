#!/usr/bin/env node

/**
 * AMZX Blockchain Private network CLI Tools
 * Developed for Diego Antunes
 * 
 * Este script fornece ferramentas de CLI para interagir com a blockchain AMZX:
 * - Criar / Derivar Endereços a partir de Seed Phrases
 * - Criar novos Tokens (Assets)
 * - Transferir ativos (AMZ Nativo ou Tokens customizados)
 * - Iniciar e gerenciar Sponsorship (Patrocínio de taxas) em tokens
 */

const wt = require('@waves/waves-transactions');

// Cores ANSI para saída estilizada de altíssimo nível (Premium Theme)
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
  bgBlue: "\x1b[44m",
  bgGreen: "\x1b[42m",
  bgRed: "\x1b[41m"
};

// Funções utilitárias de formatação
function printHeader(title) {
  console.log(`\n${colors.bold}${colors.cyan}==============================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}  🚀 AMZX BLOCKCHAIN TOOLKIT - ${title.toUpperCase()}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}==============================================================================${colors.reset}`);
}

function printFooter() {
  console.log(`${colors.bold}${colors.cyan}==============================================================================${colors.reset}\n`);
}

function printSuccess(message) {
  console.log(`\n${colors.bgGreen}${colors.bold}  SUCESSO  ${colors.reset} ${colors.green}${message}${colors.reset}`);
}

function printError(message, details = null) {
  console.log(`\n${colors.bgRed}${colors.bold}  ERRO  ${colors.reset} ${colors.red}${message}${colors.reset}`);
  if (details) {
    console.log(`${colors.dim}${typeof details === 'object' ? JSON.stringify(details, null, 2) : details}${colors.reset}`);
  }
}

function printInfo(message) {
  console.log(`${colors.bold}${colors.blue}ℹ${colors.reset} ${message}`);
}

/**
 * Converte um valor decimal em string (ex: "150.5") para unidades mínimas (satoshis)
 * de forma exata usando BigInt, evitando problemas de precisão ponto flutuante de JS.
 */
function parseAmount(amountStr, decimals) {
  if (!amountStr) return '0';
  const parts = String(amountStr).split('.');
  let integerPart = parts[0] || '0';
  let fractionalPart = parts[1] || '';
  
  if (fractionalPart.length > decimals) {
    fractionalPart = fractionalPart.substring(0, decimals);
  } else {
    fractionalPart = fractionalPart.padEnd(decimals, '0');
  }
  
  const combined = (integerPart + fractionalPart).replace(/^0+/, '');
  return combined === '' ? '0' : combined;
}

/**
 * Converte unidades mínimas (satoshis) de volta para representação decimal formatada
 */
function formatAmount(amountRaw, decimals) {
  const rawStr = String(amountRaw).padStart(decimals + 1, '0');
  const cutPoint = rawStr.length - decimals;
  const integerPart = rawStr.substring(0, cutPoint);
  const fractionalPart = rawStr.substring(cutPoint).replace(/0+$/, '');
  return fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart;
}

/**
 * Busca detalhes de um Asset no nó AMZX
 */
async function fetchAssetDetails(nodeUrl, assetId) {
  if (!assetId || assetId === 'AMZ' || assetId === 'WAVES' || assetId === 'null') {
    return { assetId: null, name: 'AMZ Nativo', decimals: 8 };
  }
  
  try {
    const response = await fetch(`${nodeUrl}/assets/details/${assetId}`);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Código de status ${response.status}: ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Não foi possível carregar os detalhes do asset '${assetId}' do nó ${nodeUrl}. Verifique se o ID está correto ou se o nó está online. Erro original: ${error.message}`);
  }
}

/**
 * Sanitiza e formata o JSON da transação, garantindo que campos numéricos de alta escala
 * (que o JS manipula como strings de BigInt) sejam convertidos em números puros sem aspas
 * no JSON enviado ao nó, evitando erros de validação Jackson/Play JSON ("error.expected.jsnumber").
 */
function prepareTxBody(tx) {
  let jsonStr = JSON.stringify(tx);
  
  // Campos de Long/Double do protocolo que devem ser numéricos literais
  const numericFields = ['quantity', 'amount', 'fee', 'minSponsoredAssetFee'];
  for (const field of numericFields) {
    const regex = new RegExp(`"${field}"\\s*:\\s*"(\\d+)"`, 'g');
    jsonStr = jsonStr.replace(regex, `"${field}":$1`);
  }
  
  return jsonStr;
}

/**
 * Transmite uma transação assinada para a rede AMZX via REST API do nó
 */
async function broadcastTx(nodeUrl, tx) {
  printInfo(`Transmitindo transação para o nó: ${nodeUrl}...`);
  try {
    const bodyStr = prepareTxBody(tx);
    const response = await fetch(`${nodeUrl}/transactions/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyStr
    });
    
    const result = await response.json();
    if (!response.ok || result.error) {
      throw {
        message: result.message || `Status HTTP ${response.status}`,
        details: result
      };
    }
    return result;
  } catch (error) {
    if (error.message && error.details) {
      throw error;
    }
    throw {
      message: `Erro de rede ao conectar com o nó em ${nodeUrl}. Certifique-se de que o nó está rodando.`,
      details: error.message
    };
  }
}

/**
 * COMANDO: criar um address
 * Argumentos opcionais: <seed> <chainId>
 */
function cmdCreateAddress(seedArg, chainIdArg) {
  printHeader("Criar / Derivar Endereço");
  
  const seed = seedArg || wt.seedUtils.generateNewSeed();
  const chainId = chainIdArg || 'A';
  
  try {
    const keyPair = wt.libs.crypto.keyPair(seed);
    const address = wt.libs.crypto.address(seed, chainId);
    
    printSuccess(seedArg ? "Endereço derivado com sucesso da Seed fornecida!" : "Nova Seed e Endereço gerados com sucesso!");
    
    console.log(`\n${colors.bold}📋 DETALHES DAS CREDENCIAIS:${colors.reset}`);
    console.log(`  ${colors.bold}Endereço (Address):${colors.reset}  ${colors.green}${colors.bold}${address}${colors.reset}`);
    console.log(`  ${colors.bold}Rede (Chain ID):${colors.reset}      ${colors.yellow}${chainId}${colors.reset} (ASCII: ${chainId.charCodeAt(0)})`);
    console.log(`  ${colors.bold}Frase Seed:${colors.reset}           ${colors.cyan}${colors.bold}${seed}${colors.reset}`);
    console.log(`  ${colors.bold}Chave Pública:${colors.reset}        ${colors.dim}${keyPair.publicKey}${colors.reset}`);
    console.log(`  ${colors.bold}Chave Privada:${colors.reset}        ${colors.dim}${keyPair.privateKey}${colors.reset}`);
    
    console.log(`\n${colors.bold}${colors.yellow}⚠️  ATENÇÃO: Guarde sua Seed Phrase em local extremamente seguro! Quem possuir a Seed tem controle total sobre os fundos deste endereço.${colors.reset}`);
    
  } catch (error) {
    printError("Falha ao gerar credenciais.", error.message);
  }
  
  printFooter();
}

/**
 * COMANDO: criar um token
 * Argumentos: <nodeUrl> <chainId> <name> <totalSupply> <decimals> <description> <seed>
 */
async function cmdCreateToken(nodeUrl, chainId, name, totalSupply, decimals, description, seed) {
  printHeader("Criar Novo Token");
  
  if (!nodeUrl || !chainId || !name || !totalSupply || !decimals || !seed) {
    printError("Parâmetros insuficientes!", "Uso: create-token <nodeUrl> <chainId> <name> <totalSupply> <decimals> <description> <seed>");
    printFooter();
    return;
  }
  
  // Validações básicas de protocolo
  if (name.length < 4 || name.length > 16) {
    printError("Nome do token inválido!", "O nome do token deve possuir entre 4 e 16 caracteres.");
    printFooter();
    return;
  }
  
  const decNum = Number(decimals);
  if (isNaN(decNum) || decNum < 0 || decNum > 8) {
    printError("Decimais inválidos!", "A quantidade de decimais do token deve ser um número inteiro entre 0 e 8.");
    printFooter();
    return;
  }
  
  try {
    printInfo(`Configurando parâmetros para criação do token "${name}"...`);
    
    // Converte o total supply real para a quantidade bruta em unidades mínimas (BigInt)
    const quantityRaw = parseAmount(totalSupply, decNum);
    
    // No Waves/AMZX, a taxa padrão para transações de Issue (Emissão) é 1 AMZ (100000000 satoshis)
    const txFee = 100000000;
    
    printInfo(`Calculando e assinando transação offline...`);
    const tx = wt.issue({
      name,
      description: description || '',
      quantity: quantityRaw,
      decimals: decNum,
      reissuable: true,
      chainId: chainId,
      fee: txFee
    }, seed);
    
    printInfo(`Transação assinada localmente com ID: ${colors.bold}${tx.id}${colors.reset}`);
    
    // Envia ao nó
    const response = await broadcastTx(nodeUrl, tx);
    
    printSuccess(`Token criado e registrado na rede com sucesso!`);
    console.log(`\n${colors.bold}📋 DETALHES DO TOKEN EMITIDO:${colors.reset}`);
    console.log(`  ${colors.bold}ID do Token (Asset ID):${colors.reset} ${colors.green}${colors.bold}${tx.id}${colors.reset}`);
    console.log(`  ${colors.bold}Nome do Token:${colors.reset}           ${colors.cyan}${colors.bold}${name}${colors.reset}`);
    console.log(`  ${colors.bold}Total Supply Emitido:${colors.reset}    ${colors.white}${totalSupply}${colors.reset}`);
    console.log(`  ${colors.bold}Decimais do Token:${colors.reset}       ${colors.white}${decimals}${colors.reset}`);
    console.log(`  ${colors.bold}Descrição:${colors.reset}               ${colors.dim}${description || '(Sem descrição)'}${colors.reset}`);
    console.log(`  ${colors.bold}Endereço Emissor:${colors.reset}        ${colors.dim}${wt.libs.crypto.address(seed, chainId)}${colors.reset}`);
    console.log(`  ${colors.bold}ID da Transação:${colors.reset}         ${colors.dim}${response.id}${colors.reset}`);
    
  } catch (error) {
    printError("Falha na criação do token.", error.message || error);
    if (error.details) {
      console.log(`\n${colors.bold}${colors.red}📋 DETALHES DE VALIDAÇÃO DO NÓ:${colors.reset}`);
      console.log(`${colors.dim}${JSON.stringify(error.details, null, 2)}${colors.reset}`);
    }
  }
  
  printFooter();
}

/**
 * COMANDO: transferir valores
 * Argumentos: <nodeUrl> <chainId> <recipient> <amount> <assetId_or_null> <fee> <seed>
 */
async function cmdTransfer(nodeUrl, chainId, recipient, amount, assetId, fee, seed) {
  printHeader("Transferir Valores");
  
  if (!nodeUrl || !chainId || !recipient || !amount || !seed) {
    printError("Parâmetros insuficientes!", "Uso: transfer <nodeUrl> <chainId> <recipient> <amount> [assetId] [fee] <seed>");
    printFooter();
    return;
  }
  
  const cleanAssetId = (!assetId || assetId === 'AMZ' || assetId === 'WAVES' || assetId === 'null' || assetId === 'undefined') ? null : assetId;
  
  try {
    printInfo("Consultando informações sobre o ativo...");
    // Obtém detalhes do token para saber os decimais de forma dinâmica e precisa!
    const assetDetails = await fetchAssetDetails(nodeUrl, cleanAssetId);
    const decimals = assetDetails.decimals;
    
    printInfo(`Ativo detectado: ${colors.bold}${assetDetails.name}${colors.reset} (Decimais: ${decimals})`);
    
    // Converte os valores reais para unidades mínimas
    const amountRaw = parseAmount(amount, decimals);
    
    // Taxa padrão se não informada para transferência: 0.001 AMZ (100000 satoshis)
    const cleanFee = fee && fee !== 'null' && fee !== 'undefined' ? fee : '0.001';
    const feeRaw = parseAmount(cleanFee, 8); // A taxa nativa sempre tem 8 decimais (AMZ)
    
    printInfo(`Preparando transferência de ${amount} ${assetDetails.name} (unidades brutas: ${amountRaw})...`);
    printInfo(`Taxa da transação: ${cleanFee} AMZ (unidades brutas: ${feeRaw})`);
    
    printInfo("Assinando transação de transferência offline...");
    const tx = wt.transfer({
      recipient,
      amount: amountRaw,
      assetId: cleanAssetId,
      fee: feeRaw,
      feeAssetId: null, // Taxa paga em AMZ nativo por padrão
      chainId: chainId
    }, seed);
    
    printInfo(`Transação assinada com ID: ${colors.bold}${tx.id}${colors.reset}`);
    
    // Envia ao nó
    const response = await broadcastTx(nodeUrl, tx);
    
    printSuccess("Transferência efetuada e transmitida com sucesso!");
    console.log(`\n${colors.bold}📋 DETALHES DA TRANSFERÊNCIA:${colors.reset}`);
    console.log(`  ${colors.bold}ID da Transação:${colors.reset}       ${colors.green}${colors.bold}${response.id}${colors.reset}`);
    console.log(`  ${colors.bold}Remetente (Sender):${colors.reset}     ${colors.dim}${wt.libs.crypto.address(seed, chainId)}${colors.reset}`);
    console.log(`  ${colors.bold}Destinatário (Recipient):${colors.reset} ${colors.cyan}${recipient}${colors.reset}`);
    console.log(`  ${colors.bold}Valor Transferido:${colors.reset}       ${colors.white}${amount} ${assetDetails.name}${colors.reset}`);
    console.log(`  ${colors.bold}Taxa Paga (Fee):${colors.reset}          ${colors.white}${cleanFee} AMZ${colors.reset}`);
    
  } catch (error) {
    printError("Falha ao realizar transferência.", error.message || error);
    if (error.details) {
      console.log(`\n${colors.bold}${colors.red}📋 DETALHES DE VALIDAÇÃO DO NÓ:${colors.reset}`);
      console.log(`${colors.dim}${JSON.stringify(error.details, null, 2)}${colors.reset}`);
    }
  }
  
  printHeader("Fim da Transferência");
}

/**
 * COMANDO: iniciar sponsorship em um token
 * Argumentos: <nodeUrl> <chainId> <tokenId> <minSponsoredAssetFee> <fee> <description> <seed>
 */
async function cmdSponsor(nodeUrl, chainId, tokenId, minSponsoredAssetFee, fee, description, seed) {
  printHeader("Iniciar Sponsorship (Patrocínio de Taxa)");
  
  if (!nodeUrl || !chainId || !tokenId || !minSponsoredAssetFee || !seed) {
    printError("Parâmetros insuficientes!", "Uso: sponsor <nodeUrl> <chainId> <tokenId> <minSponsoredAssetFee> [fee] [description] <seed>");
    printFooter();
    return;
  }
  
  try {
    printInfo(`Consultando detalhes do token customizado ${tokenId}...`);
    const assetDetails = await fetchAssetDetails(nodeUrl, tokenId);
    const decimals = assetDetails.decimals;
    
    printInfo(`Ativo a ser patrocinado: ${colors.bold}${assetDetails.name}${colors.reset} (Decimais: ${decimals})`);
    
    // Converte o valor de patrocínio informado para unidades mínimas
    // minSponsoredAssetFee é o valor correspondente do token por transação
    const minSponsoredRaw = parseAmount(minSponsoredAssetFee, decimals);
    
    // Taxa padrão para SponsorFeeTransaction no Waves/AMZX é de 1 AMZ (100000000 satoshis)
    const cleanFee = fee && fee !== 'null' && fee !== 'undefined' ? fee : '1';
    const feeRaw = parseAmount(cleanFee, 8); // Taxa sempre em AMZ (8 decimais)
    
    printInfo(`Descrição / Nota de Log: ${colors.dim}${description || '(Sem descrição)'}${colors.reset}`);
    printInfo(`Definindo patrocínio de taxa: cada transação custará ${minSponsoredAssetFee} ${assetDetails.name} ao usuário.`);
    printInfo(`Custo do registro de Sponsorship: ${cleanFee} AMZ`);
    
    printInfo("Assinando transação de Sponsorship offline...");
    const tx = wt.sponsorship({
      assetId: tokenId,
      minSponsoredAssetFee: minSponsoredRaw,
      fee: feeRaw,
      chainId: chainId
    }, seed);
    
    printInfo(`Transação de Sponsorship assinada com ID: ${colors.bold}${tx.id}${colors.reset}`);
    
    // Transmite ao nó
    const response = await broadcastTx(nodeUrl, tx);
    
    printSuccess("Sponsorship iniciado e registrado com sucesso!");
    console.log(`\n${colors.bold}📋 DETALHES DO PATROCÍNIO DE TAXAS (SPONSORSHIP):${colors.reset}`);
    console.log(`  ${colors.bold}ID da Transação:${colors.reset}             ${colors.green}${colors.bold}${response.id}${colors.reset}`);
    console.log(`  ${colors.bold}ID do Token Patrocinado:${colors.reset}    ${colors.cyan}${colors.bold}${tokenId}${colors.reset}`);
    console.log(`  ${colors.bold}Nome do Token:${colors.reset}               ${colors.white}${assetDetails.name}${colors.reset}`);
    console.log(`  ${colors.bold}Taxa em Token por transação:${colors.reset} ${colors.yellow}${minSponsoredAssetFee} ${assetDetails.name}${colors.reset} (unidades mínimas: ${minSponsoredRaw})`);
    console.log(`  ${colors.bold}Endereço Patrocinador (Sponsor):${colors.reset} ${colors.dim}${wt.libs.crypto.address(seed, chainId)}${colors.reset}`);
    console.log(`  ${colors.bold}Nota de Operação:${colors.reset}            ${colors.dim}${description || 'Configuração de Patrocínio'}${colors.reset}`);
    console.log(`\n${colors.bold}${colors.yellow}💡 NOTA: Agora os usuários da rede podem efetuar transações usando o token "${assetDetails.name}" para pagar taxas, e o custo nativo de 0.001 AMZ será debitado do saldo do endereço patrocinador! Certifique-se de manter saldo de AMZ no endereço patrocinador.${colors.reset}`);
    
  } catch (error) {
    printError("Falha ao iniciar Sponsorship.", error.message || error);
    if (error.details) {
      console.log(`\n${colors.bold}${colors.red}📋 DETALHES DE VALIDAÇÃO DO NÓ:${colors.reset}`);
      console.log(`${colors.dim}${JSON.stringify(error.details, null, 2)}${colors.reset}`);
    }
  }
  
  printFooter();
}

// Router CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`\n${colors.bold}${colors.magenta}==============================================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.magenta}                  🚀 AMZX BLOCKCHAIN CLI TOOLKIT - MENU 🚀${colors.reset}`);
    console.log(`${colors.bold}${colors.magenta}==============================================================================${colors.reset}`);
    console.log(`Disponível para interação local e remota na rede privada AMZX.\n`);
    console.log(`${colors.bold}Comandos disponíveis:${colors.reset}`);
    console.log(`  ${colors.green}create-address${colors.reset} [seed] [chainId]`);
    console.log(`  ${colors.green}create-token${colors.reset}   <nodeUrl> <chainId> <name> <totalSupply> <decimals> <description> <seed>`);
    console.log(`  ${colors.green}transfer${colors.reset}       <nodeUrl> <chainId> <recipient> <amount> [assetId] [fee] <seed>`);
    console.log(`  ${colors.green}sponsor${colors.reset}        <nodeUrl> <chainId> <tokenId> <minSponsoredAssetFee> [fee] [description] <seed>`);
    console.log(`\n${colors.bold}Exemplos rápidos de uso:${colors.reset}`);
    console.log(`  node index.js create-address`);
    console.log(`  node index.js create-token http://localhost:6869 A MyToken 1000000 8 "Meu primeiro token" "sua seed aqui"`);
    console.log(`\nDesenvolvido para Diego Antunes.`);
    console.log(`${colors.bold}${colors.magenta}==============================================================================${colors.reset}\n`);
    process.exit(0);
  }
  
  switch (command) {
    case 'create-address':
      cmdCreateAddress(args[1], args[2]);
      break;
      
    case 'create-token':
      // <nodeUrl> <chainId> <name> <totalSupply> <decimals> <description> <seed>
      await cmdCreateToken(args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
      break;
      
    case 'transfer':
      // <nodeUrl> <chainId> <recipient> <amount> [assetId] [fee] <seed>
      await cmdTransfer(args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
      break;
      
    case 'sponsor':
      // <nodeUrl> <chainId> <tokenId> <minSponsoredAssetFee> [fee] [description] <seed>
      await cmdSponsor(args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
      break;
      
    default:
      printError(`Comando desconhecido: "${command}"`, "Digite 'node index.js' sem argumentos para ver os comandos disponíveis.");
      process.exit(1);
  }
}

main().catch(err => {
  printError("Ocorreu uma falha crítica na execução do CLI.", err);
  process.exit(1);
});
