@echo off
title // VIGITEC SECURITY - Sistema Financiero
color 0C
cls

echo ================================================================
echo       // VIGITEC SECURITY - SISTEMA FINANCIERO PRIVADO
echo ================================================================
echo.
echo Iniciando aplicacion local con React y PostgreSQL ORM...
echo.

cd /d "%~dp0"

start "" http://localhost:3000

node src/server.js

pause
