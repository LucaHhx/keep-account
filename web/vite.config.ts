/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __TAURI_DEV_HOST__: JSON.stringify(process.env.TAURI_DEV_HOST || ''),
  },
  server: {
    host: process.env.TAURI_DEV_HOST || '0.0.0.0',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
