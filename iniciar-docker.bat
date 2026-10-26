@echo off
title // VIGITEC SECURITY - Docker Compose
color 0C
cls

echo ================================================================
echo       // VIGITEC SECURITY - SISTEMA FINANCIERO (DOCKER)
echo ================================================================
echo.
echo Iniciando contenedores Docker (App en puerto 3005, DB en 5433)...
echo.

cd /d "%~dp0"
docker compose up -d --build

echo.
echo ================================================================
echo Contenedores iniciados exitosamente:
echo   - Web App:       http://localhost:3005 (o http://TU_IP:3005)
echo   - PostgreSQL DB: localhost:5433        (o TU_IP:5433)
echo ================================================================
echo.

start "" http://localhost:3005

pause
