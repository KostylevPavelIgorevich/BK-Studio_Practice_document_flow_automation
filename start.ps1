Write-Host "Starting Ulanova Project..." -ForegroundColor Cyan

$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

# 1. Бэкенд
Write-Host "Setting up backend..." -ForegroundColor Yellow
Set-Location "$rootDir\backend"

if (-not (Test-Path "vendor")) { composer install --no-interaction }
if (-not (Test-Path ".env")) { Copy-Item ".env.example" ".env" }

# Настройка .env для SQLite и file-драйверов
(Get-Content ".env") -replace 'DB_CONNECTION=mysql', 'DB_CONNECTION=sqlite' | Set-Content ".env"
(Get-Content ".env") -replace 'DB_DATABASE=.*', 'DB_DATABASE=database/bd.sqlite' | Set-Content ".env"
(Get-Content ".env") -replace 'CACHE_DRIVER=.*', 'CACHE_DRIVER=file' | Set-Content ".env"
(Get-Content ".env") -replace 'SESSION_DRIVER=.*', 'SESSION_DRIVER=file' | Set-Content ".env"
(Get-Content ".env") -replace 'APP_URL=.*', 'APP_URL=http://localhost:8080' | Set-Content ".env"

php artisan key:generate --no-interaction --force

$dbPath = "database\bd.sqlite"
if (-not (Test-Path $dbPath)) { New-Item -ItemType File -Path $dbPath -Force | Out-Null }
php artisan migrate --force --seed

# 2. Фронтенд: сборка и копирование в public
Set-Location "$rootDir\frontend"
if (-not (Test-Path "node_modules")) { npm install }
if (-not (Test-Path "dist/index.html")) { npm run build }

# Копируем сборку в backend/public
Copy-Item -Path "dist/*" -Destination "$rootDir\backend\public" -Recurse -Force

# 3. Запуск сервера через router.php в отдельном окне
Write-Host "Starting backend server on http://127.0.0.1:8080" -ForegroundColor Green
Set-Location "$rootDir\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; Write-Host 'Backend server running on http://127.0.0.1:8080' -ForegroundColor Green; php -S 127.0.0.1:8080 router.php"

# Ждём, пока сервер запустится
Start-Sleep -Seconds 5

# 4. Запуск Tauri
Write-Host "Starting Tauri application..." -ForegroundColor Green
Set-Location "$rootDir\frontend"
npm run tauri dev

Write-Host "Tauri window should open now. Press Ctrl+C in this window to stop the script (server will continue)." -ForegroundColor Yellow
Read-Host "Press Enter to exit (this will NOT stop the backend server, but you may need to close its window manually)"