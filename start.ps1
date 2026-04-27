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

php artisan key:generate --no-interaction --force

$dbPath = "database\bd.sqlite"
if (-not (Test-Path $dbPath)) { New-Item -ItemType File -Path $dbPath -Force | Out-Null }
php artisan migrate --force --seed

# 2. Запуск PHP сервера в отдельном окне (НЕ копируем файлы!)
Write-Host "Starting backend server on http://127.0.0.1:8080" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; Write-Host 'Backend server running on http://127.0.0.1:8080' -ForegroundColor Green; php -S 127.0.0.1:8080 router.php"

# Ждём, пока сервер запустится
Start-Sleep -Seconds 3

# 3. Запуск Tauri в режиме разработки (БЕЗ копирования файлов!)
Write-Host "Starting Tauri application with hot reload..." -ForegroundColor Green
Set-Location "$rootDir\frontend"

# Убеждаемся что зависимости установлены
if (-not (Test-Path "node_modules")) { npm install }

# Запускаем Tauri dev (он сам запустит Vite)
npm run tauri dev

Write-Host "Tauri window should open now. Changes to code will auto-reload!" -ForegroundColor Yellow
Read-Host "Press Enter to exit (this will NOT stop the backend server, but you may need to close its window manually)"