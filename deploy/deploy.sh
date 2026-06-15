#!/usr/bin/env bash
# Executa NO SEU COMPUTADOR. Envia o código pro servidor e roda o setup remoto.
#
# Uso:
#   ./deploy/deploy.sh -i ~/caminho/chave.pem ubuntu@SEU_IP
#
set -euo pipefail

if [[ $# -lt 3 || "$1" != "-i" ]]; then
  echo "Uso: ./deploy/deploy.sh -i /caminho/chave.pem usuario@ip-do-servidor"
  exit 1
fi
PEM="$2"
TARGET="$3"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo ">> Enviando código para $TARGET (sem node_modules/dist)"
rsync -az --delete \
  --exclude node_modules --exclude dist --exclude .git \
  --exclude '.env' --exclude '*.log' --exclude '*.pem' --exclude '*.key' \
  -e "ssh -i $PEM -o StrictHostKeyChecking=accept-new" \
  "$REPO_DIR/" "$TARGET:~/pwa-varejo/"

echo ">> Executando setup remoto"
ssh -i "$PEM" "$TARGET" "chmod +x ~/pwa-varejo/deploy/remote-setup.sh && DOMAIN='${DOMAIN:-tcc.vikasoftwares.com.br}' ~/pwa-varejo/deploy/remote-setup.sh"
