#!/usr/bin/env bash
# =============================================================================
# Atualiza o BDTD na VPS com o código do GitHub (deploy de rotina).
#
#   sudo bash /opt/bdtd/deploy/deploy.sh            # último commit da branch
#   sudo bash /opt/bdtd/deploy/deploy.sh bdtd-1.0.0 # uma tag específica (rollback = tag anterior)
#
# Mudanças em deploy/ (vhost, systemd, cron, php.ini) exigem rodar provision.sh.
# =============================================================================
set -euo pipefail

APP_USER="${APP_USER:-bdtd}"
APP_DIR="${APP_DIR:-/opt/bdtd}"
CACHE_DIR="${CACHE_DIR:-/var/cache/bdtd}"
BRANCH="${BRANCH:-vufind11}"
REF="${1:-origin/$BRANCH}"
PHP_VER="8.3"

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
[[ $EUID -eq 0 ]] || { echo "Execute com sudo."; exit 1; }
as_app() { sudo -u "$APP_USER" -H bash -c "cd '$APP_DIR' && $*"; }

log "Código → $REF"
BEFORE=$(as_app "git rev-parse HEAD")
as_app "git fetch --quiet --tags origin"
if [[ "$REF" == origin/* ]]; then
  as_app "git checkout --quiet '$BRANCH' && git reset --quiet --hard '$REF'"
else
  as_app "git checkout --quiet '$REF'"
fi
AFTER=$(as_app "git rev-parse HEAD")
as_app "git log --oneline -1"

if [[ "$BEFORE" != "$AFTER" ]] && as_app "git diff --name-only $BEFORE $AFTER" | grep -qE '^composer\.(json|lock|local\.json)$'; then
  log "composer install (dependências mudaram)"
  as_app "composer install --no-dev --no-interaction --no-progress --optimize-autoloader"
else
  log "composer dump-autoload"
  as_app "composer dump-autoload --optimize --no-interaction"
fi

log "Limpando cache do VuFind"
find "$CACHE_DIR" -mindepth 1 -maxdepth 1 ! -name cli -exec rm -rf {} +
find "$CACHE_DIR/cli" -mindepth 1 -exec rm -rf {} + 2>/dev/null || true

log "Recarregando PHP-FPM"
systemctl reload "php$PHP_VER-fpm"

log "Teste rápido"
code=$(curl -s -o /dev/null -w '%{http_code}' http://localhost/vufind/)
echo "GET /vufind/ → $code"
[[ "$code" == "200" ]] || { echo "ATENÇÃO: resposta inesperada; veja /var/log/bdtd/apache-error.log"; exit 1; }
