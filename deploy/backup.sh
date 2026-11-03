#!/bin/bash
# Backup local de MongoDB (mongodump) con retención de N días.
# La contraseña se lee de ~/catalogo/.mongo-pass (fuera del repo).
set -euo pipefail

CONTAINER="mongo"
BACKUP_DIR="/home/Santiago/backups/mongo"
RETENTION_DAYS=7
PASSWORD_FILE="/home/Santiago/catalogo/.mongo-pass"

mkdir -p "$BACKUP_DIR"

MONGO_PASSWORD=$(cat "$PASSWORD_FILE")
TIMESTAMP=$(date +%F-%H%M%S)
OUTFILE="$BACKUP_DIR/backup-$TIMESTAMP.gz"

docker exec "$CONTAINER" mongodump \
  --db catalogo \
  --archive \
  --gzip \
  --authenticationDatabase admin \
  -u catalogo \
  -p "$MONGO_PASSWORD" > "$OUTFILE"

find "$BACKUP_DIR" -name 'backup-*.gz' -mtime +"$RETENTION_DAYS" -delete

echo "✅ Backup creado: $OUTFILE ($(du -h "$OUTFILE" | cut -f1))"
