const { spawn } = require('child_process');
const path = require('path');

const BACKEND_DIR = path.resolve(__dirname, '../backend');
const BACKEND_SCRIPT = path.join(BACKEND_DIR, 'start-backend.cjs');

let backendProcess = null;

function startBackend() {
    console.log('🚀 Запуск Laravel сервера...');
    backendProcess = spawn('node', [BACKEND_SCRIPT], {
        cwd: BACKEND_DIR,
        stdio: 'inherit',
        shell: true,
    });
    backendProcess.on('error', (err) => {
        console.error('❌ Ошибка запуска бэкенда:', err);
        process.exit(1);
    });
}

function startTauri() {
    console.log('🎨 Запуск Tauri...');
    const tauri = spawn('npm', ['run', 'tauri', 'dev'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true,
    });
    tauri.on('close', (code) => {
        console.log(`Tauri завершён (код ${code})`);
        if (backendProcess) backendProcess.kill();
        process.exit(code);
    });
}

startBackend();
setTimeout(() => {
    startTauri();
}, 8000); // даём бэкенду 8 секунд на первый запуск (миграции могут быть долгими)