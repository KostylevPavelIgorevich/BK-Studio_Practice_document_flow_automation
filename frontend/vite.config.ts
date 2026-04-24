import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: false,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/csrf-token': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
      '/templates': {                       // ← ДОБАВИТЬ ЭТОТ БЛОК
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
      '/documents': {                       // ← ДЛЯ ДОКУМЕНТОВ ТОЖЕ
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
      '/users': {                           // ← ДЛЯ ПОЛЬЗОВАТЕЛЕЙ
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
      '/groups': {                          // ← ДЛЯ ГРУПП
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
      '/document-types': {                  // ← ДЛЯ ТИПОВ ДОКУМЕНТОВ
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
});