import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // すべてのネットワークインターフェースでリッスン
    port: 5173, // デフォルトのポート番号（必要に応じて変更可能）
  }
})
