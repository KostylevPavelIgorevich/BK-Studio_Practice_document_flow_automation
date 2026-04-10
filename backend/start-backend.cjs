const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;

function runCommand(command, args) {
    console.log(`> ${command} ${args.join(' ')}`);
    try {
        execSync(`${command} ${args.join(' ')}`, { cwd: projectRoot, stdio: 'inherit' });
    } catch (err) {
        throw new Error(`Command failed: ${command} ${args.join(' ')}`);
    }
}

(async () => {
    console.log('🚀 Настройка Laravel backend...');

    // 1. Composer install
    if (!fs.existsSync(path.join(projectRoot, 'vendor'))) {
        console.log('📦 Composer install...');
        runCommand('composer', ['install', '--no-interaction']);
    }

    // 2. База данных SQLite
    const dbDir = path.join(projectRoot, 'database');
    const dbFile = path.join(dbDir, 'bd.sqlite');
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    if (!fs.existsSync(dbFile)) {
        console.log('📁 Создание базы данных...');
        fs.writeFileSync(dbFile, '');
    }

    // 3. .env из .env.example
    const envExample = path.join(projectRoot, '.env.example');
    const envFile = path.join(projectRoot, '.env');
    if (!fs.existsSync(envFile)) {
        if (!fs.existsSync(envExample)) throw new Error('.env.example не найден');
        console.log('📝 Создание .env');
        fs.copyFileSync(envExample, envFile);
    }

    // 4. Прописать настройки БД в .env
    let envContent = fs.readFileSync(envFile, 'utf8');
    if (!envContent.includes('DB_CONNECTION=sqlite')) {
        envContent += '\nDB_CONNECTION=sqlite\n';
    }
    if (!envContent.includes('DB_DATABASE=')) {
        envContent += `DB_DATABASE=${dbFile.replace(/\\/g, '/')}\n`;
    }
    fs.writeFileSync(envFile, envContent);

    // 5. Генерация ключа
    console.log('🔑 Генерация APP_KEY...');
    runCommand('php', ['artisan', 'key:generate', '--no-interaction']);

    // 6. Миграции + сиды
    console.log('🔄 Миграции...');
    runCommand('php', ['artisan', 'migrate', '--force', '--seed']);

    // 7. Запуск сервера (блокирует процесс)
    console.log('🌐 Запуск сервера на http://127.0.0.1:8000');
    const server = spawn('php', ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'], {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: true,
    });
    server.on('close', (code) => {
        console.log(`Сервер остановлен (код ${code})`);
        process.exit(code);
    });
})();