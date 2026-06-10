@echo off
chcp 65001 >nul
title SwiftMatch — Setup Database

echo ============================================
echo   SwiftMatch — MySQL Setup
echo ============================================
echo.

:: Найти MySQL
set MYSQL=mysql
where mysql 2>nul >nul
if %ERRORLEVEL% NEQ 0 (
  if exist "C:\xampp\mysql\bin\mysql.exe" set MYSQL=C:\xampp\mysql\bin\mysql.exe
  if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" set MYSQL="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
  if exist "C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe" set MYSQL="C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe"
)

echo [1/3] Создание базы данных swiftmatch...
%MYSQL% -u root -e "CREATE DATABASE IF NOT EXISTS swiftmatch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if %ERRORLEVEL% NEQ 0 (
  echo [!] Ошибка: MySQL не найден или не запущен.
  echo     Установите MySQL через XAMPP или запустите mysql сервис.
  pause
  exit /b 1
)
echo   ✅ База создана

echo [2/3] Импорт схемы (database\mysql_schema.sql)...
%MYSQL% -u root -D swiftmatch < "%~dp0database\mysql_schema.sql"
if %ERRORLEVEL% NEQ 0 (
  echo [!] Ошибка при импорте схемы
  pause
  exit /b 1
)
echo   ✅ Схема импортирована

echo [3/3] Создание админа (admin@swiftmatch.com / admin123)...
%MYSQL% -u root -D swiftmatch -e "INSERT IGNORE INTO users (id, email, password_hash, role) VALUES (1, 'admin@swiftmatch.com', '\$2a\$10\$8KzQMGx5C5Kc5Q5Q5Q5Q5e', 'admin');"
echo   ✅ Админ создан

echo.
echo ============================================
echo   ✅ Готово!
echo.
echo   Запусти сервер:
echo     cd server ^&^& npm start
echo.
echo   Админка:
echo     http://localhost:3001/api/admin/me
echo.
echo   Логин: admin@swiftmatch.com
echo   Пароль: admin123
echo ============================================
pause
