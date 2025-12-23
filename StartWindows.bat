@echo off
echo Iniciando servicios...

start "Auth Service" cmd /k "cd Auth && node server.js"
start "Market Service" cmd /k "cd Market && node server.js"
start "Gateway" cmd /k "cd Router && node server.js"

echo Todos los servicios arrancados.
pause
