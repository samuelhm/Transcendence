#!/usr/bin/env bash

echo "Iniciando servicios..."

# Mover al directorio raíz del proyecto
BASE_DIR="$(dirname "$0")"
cd "$BASE_DIR"

gnome-terminal -- bash -c "cd Auth && echo 'Auth Service' && node server.js; exec bash"
gnome-terminal -- bash -c "cd Market && echo 'Market Service' && node server.js; exec bash"
gnome-terminal -- bash -c "cd Router && echo 'Gateway' && node server.js; exec bash"

echo "Todos los servicios han sido arrancados."
