#!/usr/bin/env bash
BASE_DIR="$(dirname "$(realpath "$0")")"

# 1. Creamos la red
docker network create ventonet 2>/dev/null || true

# 2. Limpieza
docker rm -f auth market router postgres-db 2>/dev/null

echo "--- Iniciando Postgres ---"

# IMPORTANTE: Asegúrate de que tu archivo SQL se llame 'init.sql'
# y esté en la misma carpeta que este script.
# Si tu archivo se llama de otra forma, cambia el nombre abajo.

gnome-terminal --title="Postgres" -- bash -c \
"docker run --rm -it \
 --name postgres-db \
 --network ventonet \
 -p 5432:5432 \
 -e POSTGRES_DB=ventodb \
 -e POSTGRES_USER=backuser \
 -e POSTGRES_PASSWORD=transcendence \
 -v \"$BASE_DIR/postgres_data\":/var/lib/postgresql/data \
 -v \"$BASE_DIR/init.sql\":/docker-entrypoint-initdb.d/init.sql \
 postgres:16-alpine; exec bash"

# ^^^^ LA LÍNEA DE ARRIBA (-v ...init.sql) ES LA QUE FALTABA ^^^^

lanzar() {
    local NAME="$1"
    local PORT="$2"
    # Convertimos el nombre a minúsculas para el hostname de red (Auth -> auth)
    # Esto evita problemas de DNS en Docker
    local HOSTNAME=$(echo "$NAME" | tr '[:upper:]' '[:lower:]')

    gnome-terminal --title="$NAME" -- bash -c \
    "docker run --rm -it \
     --name $HOSTNAME \
     --network ventonet \
     -v \"$BASE_DIR/$NAME\":/app \
     -w /app \
     -p $PORT:$PORT \
     node:24-alpine /bin/sh -c 'npm install && npm start'; \
     exec bash"
}

# Esperamos a que la DB arranque de verdad (después del reinicio que viste en los logs)
echo "Esperando inicialización de DB..."
sleep 5

lanzar "Auth" "3001"
lanzar "Market" "3002"
lanzar "Router" "3000"
