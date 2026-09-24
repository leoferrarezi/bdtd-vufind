#!/usr/bin/env bash
# =============================================================================
# Provisiona uma VPS Ubuntu 24.04 para o BDTD (VuFind 11).
#
# Idempotente: pode ser executado de novo a qualquer momento; cada etapa só
# faz o que ainda falta. Uso (na VPS, como usuário com sudo):
#
#   curl -fsSL https://raw.githubusercontent.com/leoferrarezi/bdtd-vufind/vufind11/deploy/provision.sh -o provision.sh
#   sudo bash provision.sh
#
# Variáveis que podem ser sobrescritas pelo ambiente: ver bloco "Parâmetros".
# =============================================================================
set -euo pipefail

# ---------------------------------------------------------------- Parâmetros
APP_USER="${APP_USER:-bdtd}"                      # dono do código
APP_DIR="${APP_DIR:-/opt/bdtd}"                   # VUFIND_HOME
REPO_URL="${REPO_URL:-https://github.com/leoferrarezi/bdtd-vufind.git}"
BRANCH="${BRANCH:-vufind11}"
CACHE_DIR="${CACHE_DIR:-/var/cache/bdtd}"         # VUFIND_CACHE_DIR (fora do repo)
LOG_DIR="${LOG_DIR:-/var/log/bdtd}"
SECRETS_DIR="${SECRETS_DIR:-/etc/bdtd/secrets}"
DB_NAME="${DB_NAME:-vufind}"
DB_USER="${DB_USER:-vufind}"
PUBLIC_URL="${PUBLIC_URL:-http://103.14.27.53:10080}"
TIMEZONE="${TIMEZONE:-America/Sao_Paulo}"
SWAP_SIZE="${SWAP_SIZE:-4G}"
LOCAL_MODULES="${LOCAL_MODULES-Bdtd}"             # vazio = VuFind puro (antes do módulo estar portado)
PHP_VER="8.3"

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
[[ $EUID -eq 0 ]] || { echo "Execute com sudo."; exit 1; }
export DEBIAN_FRONTEND=noninteractive

# ------------------------------------------------------------- 1. Sistema base
log "1. Sistema base (fuso, pacotes, atualizações automáticas, swap)"
timedatectl set-timezone "$TIMEZONE"
apt-get update -q
apt-get upgrade -yq
apt-get install -yq \
  git unzip curl ca-certificates acl cron logrotate \
  unattended-upgrades fail2ban ufw \
  apache2 \
  php${PHP_VER}-fpm php${PHP_VER}-cli php${PHP_VER}-intl php${PHP_VER}-xsl php${PHP_VER}-xml \
  php${PHP_VER}-pgsql php${PHP_VER}-mbstring php${PHP_VER}-gd php${PHP_VER}-curl \
  php${PHP_VER}-zip php${PHP_VER}-apcu php${PHP_VER}-bcmath php${PHP_VER}-soap \
  composer \
  postgresql postgresql-contrib \
  openjdk-21-jre-headless
dpkg-reconfigure -f noninteractive unattended-upgrades

if ! swapon --show | grep -q .; then
  fallocate -l "$SWAP_SIZE" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl -w vm.swappiness=10
  echo 'vm.swappiness=10' > /etc/sysctl.d/99-bdtd-swap.conf
fi

# ------------------------------------------------------------- 2. Firewall
log "2. Firewall (ufw: só SSH e HTTP/HTTPS; Solr e Postgres ficam internos)"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp  >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null
systemctl enable --now fail2ban

# ------------------------------------------------------------- 3. Usuário e diretórios
log "3. Usuário $APP_USER e diretórios"
id "$APP_USER" &>/dev/null || useradd --system --create-home --home-dir "/home/$APP_USER" --shell /bin/bash "$APP_USER"
usermod -aG "$APP_USER" www-data
install -d -o "$APP_USER" -g "$APP_USER" -m 755 "$APP_DIR"
install -d -o www-data -g "$APP_USER" -m 2775 "$CACHE_DIR" "$CACHE_DIR/cli"
install -d -o www-data -g "$APP_USER" -m 2775 "$LOG_DIR"
install -d -o root -g www-data -m 750 "$SECRETS_DIR"
install -d -o postgres -g postgres -m 750 /var/backups/bdtd

# ------------------------------------------------------------- 4. Código
log "4. Código ($REPO_URL, branch $BRANCH)"
if [[ ! -d "$APP_DIR/.git" ]]; then
  sudo -u "$APP_USER" git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  sudo -u "$APP_USER" git -C "$APP_DIR" fetch --quiet origin
  sudo -u "$APP_USER" git -C "$APP_DIR" checkout --quiet "$BRANCH"
  sudo -u "$APP_USER" git -C "$APP_DIR" pull --ff-only --quiet origin "$BRANCH"
fi

# composer post-install baixa o Solr (phing installsolr) para solr/vendor
log "4b. Dependências PHP (composer --no-dev) + Solr"
sudo -u "$APP_USER" -H bash -c "cd '$APP_DIR' && composer install --no-dev --no-interaction --no-progress --optimize-autoloader"

# ------------------------------------------------------------- 5. PostgreSQL
log "5. PostgreSQL (banco $DB_NAME, usuário $DB_USER)"
if [[ ! -s "$SECRETS_DIR/db_password" ]]; then
  umask 027
  openssl rand -base64 32 | tr -d '/+=\n' > "$SECRETS_DIR/db_password"
  chgrp www-data "$SECRETS_DIR/db_password"
  chmod 640 "$SECRETS_DIR/db_password"
fi
DB_PASS="$(cat "$SECRETS_DIR/db_password")"
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1; then
  sudo -u postgres psql -q -c "CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASS'"
else
  sudo -u postgres psql -q -c "ALTER ROLE $DB_USER PASSWORD '$DB_PASS'"
fi
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1; then
  sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"
fi
# schema do VuFind: só aplica se a tabela "user" ainda não existir
if ! PGPASSWORD="$DB_PASS" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT to_regclass('public.\"user\"')" | grep -q user; then
  PGPASSWORD="$DB_PASS" psql -q -h localhost -U "$DB_USER" -d "$DB_NAME" -f "$APP_DIR/module/VuFind/sql/pgsql.sql"
fi

# ------------------------------------------------------------- 6. Solr (systemd)
log "6. Solr como serviço (somente 127.0.0.1)"
MEM_MB=$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)
SOLR_HEAP_MB=$(( MEM_MB / 2 )); (( SOLR_HEAP_MB > 8192 )) && SOLR_HEAP_MB=8192
install -m 644 "$APP_DIR/deploy/systemd/bdtd-solr.service" /etc/systemd/system/bdtd-solr.service
install -d /etc/systemd/system/bdtd-solr.service.d
cat > /etc/systemd/system/bdtd-solr.service.d/override.conf <<EOF
[Service]
Environment=VUFIND_HOME=$APP_DIR
Environment=SOLR_HEAP=${SOLR_HEAP_MB}m
User=$APP_USER
Group=$APP_USER
EOF
# limites recomendados pelo Solr
cat > /etc/security/limits.d/bdtd-solr.conf <<EOF
$APP_USER soft nofile 65000
$APP_USER hard nofile 65000
$APP_USER soft nproc 65000
$APP_USER hard nproc 65000
EOF
systemctl daemon-reload
systemctl enable bdtd-solr >/dev/null
systemctl restart bdtd-solr

# ------------------------------------------------------------- 7. PHP-FPM
log "7. PHP-FPM (opcache, apcu, limites)"
install -m 644 "$APP_DIR/deploy/php/99-bdtd.ini" "/etc/php/$PHP_VER/fpm/conf.d/99-bdtd.ini"
install -m 644 "$APP_DIR/deploy/php/99-bdtd.ini" "/etc/php/$PHP_VER/cli/conf.d/99-bdtd.ini"
systemctl restart "php$PHP_VER-fpm"

# ------------------------------------------------------------- 8. Apache
log "8. Apache (vhost BDTD)"
a2enmod -q proxy_fcgi setenvif rewrite headers expires deflate remoteip >/dev/null
a2enconf -q "php$PHP_VER-fpm" >/dev/null
sed -e "s#@APP_DIR@#$APP_DIR#g" -e "s#@CACHE_DIR@#$CACHE_DIR#g" -e "s#@LOG_DIR@#$LOG_DIR#g" \
    -e "s#@LOCAL_MODULES@#$LOCAL_MODULES#g" \
    "$APP_DIR/deploy/apache/bdtd.conf" > /etc/apache2/sites-available/bdtd.conf
[[ -n "$LOCAL_MODULES" ]] || sed -i '/VUFIND_LOCAL_MODULES/d' /etc/apache2/sites-available/bdtd.conf
a2dissite -q 000-default >/dev/null 2>&1 || true
a2ensite -q bdtd >/dev/null
apache2ctl configtest
systemctl reload apache2

# ------------------------------------------------------------- 9. Rotinas
log "9. Cron e logrotate"
sed -e "s#@APP_DIR@#$APP_DIR#g" -e "s#@APP_USER@#$APP_USER#g" -e "s#@LOG_DIR@#$LOG_DIR#g" \
    "$APP_DIR/deploy/cron/bdtd" > /etc/cron.d/bdtd
chmod 644 /etc/cron.d/bdtd
sed -e "s#@LOG_DIR@#$LOG_DIR#g" "$APP_DIR/deploy/logrotate/bdtd" > /etc/logrotate.d/bdtd

# ------------------------------------------------------------- 10. Permissões finais
log "10. Permissões"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
setfacl -R -m u:www-data:rwX "$CACHE_DIR" "$LOG_DIR"
setfacl -R -d -m u:www-data:rwX -m u:"$APP_USER":rwX "$CACHE_DIR" "$LOG_DIR"

log "Pronto. Verificações:"
systemctl is-active bdtd-solr apache2 "php$PHP_VER-fpm" postgresql
echo "URL pública: $PUBLIC_URL"
