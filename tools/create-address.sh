#!/bin/bash

# Resolve o diretório onde o script está localizado para garantir que ele ache o index.js correto
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Executa o utilitário Node correspondente
node "$DIR/index.js" create-address "$@"
