#!/bin/bash

# Resolve o diretório onde o script está localizado para garantir que ele ache o index.js correto
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$#" -lt 5 ]; then
  echo -e "\x1b[31m\x1b[1mErro: Parâmetros insuficientes!\x1b[0m"
  echo "Uso correto:"
  echo "  ./sponsor.sh <nodeUrl> <chainId> <tokenId> <minSponsoredAssetFee> [fee] [description] <seed>"
  echo ""
  echo "Exemplo:"
  echo "  ./sponsor.sh http://localhost:6869 A 5rxiLQ3Vnpkdgj9jN1GFp2NY6T8PoA5V2wFD1rPXWAth 1.0 1 \"Taxa patrocinada\" \"sua seed aqui\""
  exit 1
fi

# Mapeia dinamicamente os argumentos dependendo de quantos foram informados
if [ "$#" -eq 5 ]; then
  # <nodeUrl> <chainId> <tokenId> <minSponsoredAssetFee> <seed>
  node "$DIR/index.js" sponsor "$1" "$2" "$3" "$4" "null" "Sponsorship" "$5"
elif [ "$#" -eq 6 ]; then
  # <nodeUrl> <chainId> <tokenId> <minSponsoredAssetFee> <fee> <seed>
  node "$DIR/index.js" sponsor "$1" "$2" "$3" "$4" "$5" "Sponsorship" "$6"
else
  # <nodeUrl> <chainId> <tokenId> <minSponsoredAssetFee> <fee> <description> <seed>
  node "$DIR/index.js" sponsor "$1" "$2" "$3" "$4" "$5" "$6" "$7"
fi
