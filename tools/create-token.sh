#!/bin/bash

# Resolve o diretório onde o script está localizado para garantir que ele ache o index.js correto
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$#" -lt 6 ]; then
  echo -e "\x1b[31m\x1b[1mErro: Parâmetros insuficientes!\x1b[0m"
  echo "Uso correto:"
  echo "  ./create-token.sh <nodeUrl> <chainId> <name> <totalSupply> <decimals> <description> <seed>"
  echo ""
  echo "Exemplo:"
  echo "  ./create-token.sh http://localhost:6869 A \"Meu Token\" 1000000 8 \"Moeda de teste\" \"sua seed aqui\""
  exit 1
fi

# Executa o utilitário Node correspondente
node "$DIR/index.js" create-token "$1" "$2" "$3" "$4" "$5" "$6" "$7"
