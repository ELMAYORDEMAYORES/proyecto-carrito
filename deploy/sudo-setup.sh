#!/bin/bash
# Configuración inicial (una sola vez) — ejecutar con: sudo bash ~/catalogo/deploy/sudo-setup.sh
# Crea /var/www/catalogo, copia el frontend, escribe la config de nginx y recarga.
set -e

# Con sudo, $HOME es /root; usar la ruta real del usuario.
SRC="/home/Santiago/catalogo"
APP_DIR="/var/www/catalogo"
NGINX_CONF="/etc/nginx/sites-available/catalogo"
DOMAIN="catalogo.appco.com.co"

echo "== [1/5] Creando directorios =="
mkdir -p "$APP_DIR/dist" "$APP_DIR/uploads"

echo "== [2/5] Copiando frontend (build) =="
if [ -d "$SRC/client-dist" ]; then
  rsync -a --delete "$SRC/client-dist/" "$APP_DIR/dist/"
  echo "  frontend copiado."
else
  echo "  ADVERTENCIA: no existe $SRC/client-dist (el build aún no está subido)."
fi

echo "== [3/5] Permisos (Santiago para futuros deploys sin sudo) =="
chown -R Santiago:Santiago "$APP_DIR"

echo "== [4/5] Config de nginx =="
cp "$SRC/deploy/nginx-catalogo.conf" "$NGINX_CONF"
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/catalogo

echo "== [5/5] Test + recarga de nginx =="
nginx -t
systemctl reload nginx

echo ""
echo "✅ Configuración lista. Dominio: https://$DOMAIN"
echo "   Falta (en Cloudflare): crear el registro DNS A -> la IP del VPS."
