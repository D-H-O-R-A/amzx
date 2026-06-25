#!/bin/bash

# Resolve o diretório onde o script está localizado para garantir que ele ache o index.js correto
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$#" -lt 5 ]; then
  echo -e "\x1b[31m\x1b[1mErro: Parâmetros insuficientes!\x1b[0m"
  echo "Uso correto:"
  echo "  ./transfer.sh <nodeUrl> <chainId> <recipient> <amount> [assetId] [fee] <seed>"
  echo ""
  echo "Exemplo (enviar AMZ nativo):"
  echo "  ./transfer.sh http://localhost:6869 A 3EZPNrrkLaFe9YuW2ndyqMWK45Kx1btMbT6 150.5 null null \"sua seed aqui\""
  echo ""
  echo "Exemplo (enviar Token Customizado):"
  echo "  ./transfer.sh http://localhost:6869 A 3EZPNrrkLaFe9YuW2ndyqMWK45Kx1btMbT6 1000 5rxiLQ3Vnpkdgj9jN1GFp2NY6T8PoA5V2wFD1rPXWAth 0.001 \"sua seed aqui\""
  exit 1
fi

# No Waves/AMZX, se passar menos de 7 argumentos (ou seja, não passar assetId ou fee),
# nós mapeamos adequadamente para o index.js.
# Se receber 5 argumentos: nodeUrl, chainId, recipient, amount, seed
# Mapeia para: nodeUrl, chainId, recipient, amount, null, null, seed
if [ "$#" -eq 5 ]; then
  node "$DIR/index.js" transfer "$1" "$2" "$3" "$4" "null" "null" "$5"
# Se receber 6 argumentos: nodeUrl, chainId, recipient, amount, assetId, seed
# Mapeia para: nodeUrl, chainId, recipient, amount, assetId, null, seed
elif [ "$#" -eq 6 ]; then
  node "$DIR/index.js" transfer "$1" "$2" "$3" "$4" "$5" "null" "$6"
else
  node "$DIR/index.js" transfer "$1" "$2" "$3" "$4" "$5" "$6" "$7"
fi
