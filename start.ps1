Write-Host "Starting Ulanova Project..." -ForegroundColor Cyan

# 1. Бэкенд
Set-Location backend
if (-not (Test-Path "vendor")) { composer install --no-interaction }
if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }
php artisan key:generate --no-interaction
$dbPath = "database\bd.sqlite"
if (-not (Test-Path $dbPath)) { New-Item -ItemType File -Path $dbPath -Force | Out-Null }
php artisan migrate --force --seed

# 2. Запуск сервера в отдельном окне
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; php artisan serve --host=127.0.0.1 --port=8000"

# 3. Фронтенд + Tauri
Set-Location ..\frontend
if (-not (Test-Path "node_modules")) { npm install }
npm run tauri dev

Read-Host "Press Enter to exit"