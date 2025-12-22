import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import dotenv from 'dotenv'
import Components from 'unplugin-vue-components/vite'
import {PrimeVueResolver} from '@primevue/auto-import-resolver';
import tailwindcss from '@tailwindcss/vite'
dotenv.config()

const VITE_CLIENT_URL = process.env.VITE_CLIENT_URL || ''
const VITE_WS_URL = process.env.VITE_WS_URL || ''

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    vue(),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
    tailwindcss(),
    vueDevTools(),
  ],
  server: {
    host: '0.0.0.0',
    proxy: {
      [`^/api`]: {
        target: VITE_CLIENT_URL,
        changeOrigin: true,
      },
      [`^/ws`]: {
        target: VITE_WS_URL,
        changeOrigin: true,
      },
    },
  },
})
