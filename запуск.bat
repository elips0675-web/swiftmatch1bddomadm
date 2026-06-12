@echo off
chcp 65001 >nul
title SwiftMatch — Запуск

echo ============================================
echo   SwiftMatch — Запуск API + Фронтенд
echo ============================================
echo.

:: 1. Проверка MySQL
echo [1/3] Проверка MySQL...
where mysql 2>nul >nul
if %ERRORLEVEL% NEQ 0 (
  echo   ⚠ MySQL не найден в PATH. Убедись что XAMPP запущен.
  echo.
) else (
  echo   ✅ MySQL доступен
)

:: 2. Запуск API сервера (порт 3002)
echo [2/3] Запуск API сервера (порт 3002)...
start "SwiftMatch API" cmd /c "cd /d C:\swiftmatch1bd\server && npm start"
if %ERRORLEVEL% NEQ 0 (
  echo   ✘ Ошибка запуска API
  pause
  exit /b 1
)
echo   ✅ API сервер запущен

:: Ждём пока API встанет
timeout /t 3 /nobreak >nul

:: 3. Запуск фронтенда (порт 8081)
echo [3/3] Запуск фронтенда (порт 8081)...
echo.
echo   Открой в браузере: http://localhost:8081
echo.
cd /d C:\swiftmatch1bd
npx vite --port 8081 --host 127.0.0.1
pause
