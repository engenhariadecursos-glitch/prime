@echo off
echo ==========================================
echo   PRIME PREMIUM V2 - Iniciando app...
echo ==========================================
echo.

:: Mata processos Node antigos
echo [1/3] Encerrando servidores antigos...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

:: Limpa cache do Metro/Expo
echo [2/3] Limpando cache...
if exist ".expo" rmdir /s /q ".expo" >nul 2>&1
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache" >nul 2>&1

:: Inicia o servidor com o expo LOCAL
echo [3/3] Iniciando Metro Bundler...
echo.
echo Aguarde o QR Code aparecer abaixo...
echo Escaneie com o Expo Go no celular.
echo.

node ./node_modules/expo/bin/cli start --clear
