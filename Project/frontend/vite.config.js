import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash]-v2.js',
        chunkFileNames: 'assets/[name]-[hash]-v2.js',
        assetFileNames: 'assets/[name]-[hash]-v2.[ext]',
      },
    },
  },
  server: {
    proxy: {
      '/api': { target: process.env.VITE_BACKEND_URL || 'http://localhost:4000', changeOrigin: true },
    },
  },
  test: { environment: 'jsdom', setupFiles: './src/test/setup.js', css: true },
})
