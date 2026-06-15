#!/usr/bin/env bash
# Executa NO SERVIDOR (Ubuntu/Debian). Chamado pelo deploy.sh, mas pode rodar manualmente.
# Sobe Postgres + API + frontend em Docker e publica via nginx do host com HTTPS (Let's Encrypt).
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/pwa-varejo}"
cd "$APP_DIR/deploy"

# ----- 0. Descobrir IP público e domínio sslip.io -----
PUBLIC_IP="$(curl -s --max-time 5 https://checkip.amazonaws.com || true)"
PUBLIC_IP="${PUBLIC_IP//[$'\n\r ']}"
if [[ -z "$PUBLIC_IP" ]]; then
  echo "ERRO: não consegui descobrir o IP público."; exit 1
fi
DOMAIN="${DOMAIN:-${PUBLIC_IP//./-}.sslip.io}"
echo ">> Domínio: $DOMAIN"

# ----- 1. .env (gera senhas fortes na primeira vez) -----
if [[ ! -f .env ]]; then
  echo ">> Gerando .env com segredos aleatórios"
  cat > .env <<EOF
DB_USERNAME=postgres
DB_PASSWORD=$(openssl rand -hex 24)
DB_NAME=pwa_varejo
JWT_SECRET=$(openssl rand -hex 48)
JWT_EXPIRATION=24h
CORS_ORIGIN=https://$DOMAIN
STORE_NAME=Loja Teste
EOF
  chmod 600 .env
  FIRST_INSTALL=1
else
  FIRST_INSTALL=0
fi

# ----- 1b. Swap (instâncias pequenas, ex.: Lightsail 1GB, precisam para o build) -----
TOTAL_MEM_MB=$(free -m | awk '/^Mem:/{print $2}')
if [[ "$TOTAL_MEM_MB" -lt 1900 && ! -f /swapfile ]]; then
  echo ">> Criando swap de 2GB (RAM detectada: ${TOTAL_MEM_MB}MB)"
  sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
  sudo mkswap /swapfile && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

# ----- 1c. Stack Bitnami (Lightsail): libera as portas 80/443 se autorizado -----
if [[ -d /opt/bitnami ]]; then
  if sudo ss -ltn 2>/dev/null | grep -qE ':(80|443)\s'; then
    if [[ "${STOP_BITNAMI:-0}" == "1" ]]; then
      echo ">> Parando Apache do stack Bitnami (STOP_BITNAMI=1)"
      sudo /opt/bitnami/ctlscript.sh stop apache || true
      sudo systemctl disable bitnami 2>/dev/null || true
    else
      echo "AVISO: stack Bitnami detectado usando as portas 80/443."
      echo "Se nada importante roda nele, execute novamente com:"
      echo "  STOP_BITNAMI=1 ~/pwa-varejo/deploy/remote-setup.sh"
      exit 1
    fi
  fi
fi

# ----- 2. Docker -----
if ! command -v docker >/dev/null 2>&1; then
  echo ">> Instalando Docker"
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER" || true
fi
DOCKER="docker"
docker info >/dev/null 2>&1 || DOCKER="sudo docker"

# ----- 3. Build e subida dos containers -----
echo ">> Subindo containers (build pode demorar alguns minutos)"
$DOCKER compose -f docker-compose.prod.yml --env-file .env up -d --build

# ----- 4. Seed inicial (somente na primeira instalação) -----
if [[ "$FIRST_INSTALL" == "1" ]]; then
  echo ">> Aguardando API e rodando seed inicial"
  sleep 10
  $DOCKER compose -f docker-compose.prod.yml exec -T backend npm run seed || \
    echo "AVISO: seed falhou (talvez já exista). Siga em frente."
fi

# ----- 5. Nginx do host -----
if ! command -v nginx >/dev/null 2>&1; then
  PORT80_PID="$(sudo ss -ltnp 2>/dev/null | awk '$4 ~ /:80$/ {print $6}' | head -1 || true)"
  if [[ -n "$PORT80_PID" ]]; then
    echo "ERRO: a porta 80 está em uso por outro serviço que não é nginx:"
    echo "  $PORT80_PID"
    echo "Me diga o que é esse serviço para eu adaptar a configuração."
    exit 1
  fi
  echo ">> Instalando nginx"
  sudo apt-get update -qq && sudo apt-get install -y -qq nginx
fi

echo ">> Configurando site no nginx"
sudo tee /etc/nginx/sites-available/pwa-varejo.conf >/dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    client_max_body_size 10m;

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host \$host;
    }
}
EOF
sudo ln -sf /etc/nginx/sites-available/pwa-varejo.conf /etc/nginx/sites-enabled/pwa-varejo.conf
sudo nginx -t && sudo systemctl reload nginx

# ----- 6. HTTPS com Let's Encrypt -----
if ! command -v certbot >/dev/null 2>&1; then
  echo ">> Instalando certbot"
  sudo apt-get install -y -qq certbot python3-certbot-nginx
fi
if ! sudo test -d "/etc/letsencrypt/live/$DOMAIN"; then
  echo ">> Emitindo certificado para $DOMAIN"
  sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect
else
  echo ">> Certificado já existe"
fi

echo ""
echo "=============================================="
echo " Deploy concluído!"
echo " App:     https://$DOMAIN"
echo " API:     https://$DOMAIN/api"
echo " Swagger: https://$DOMAIN/api/docs"
echo " Login demo: admin@pwavarejo.com / admin123"
echo "=============================================="
