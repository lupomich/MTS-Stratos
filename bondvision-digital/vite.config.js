import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.VITE_PORT || 3002),
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 300,
    },
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'bondvision-digital',
      'bondvision-digital-java',
      'host.docker.internal'
    ],
    proxy: {
      '/api': {
        // VITE_BACKEND_TARGET env var lets docker-compose select the active backend:
        //   default (Node.js):  http://bondvision-backend:3000
        //   Java backend:       http://bondvision-backend-java:3001  (set via docker-compose.java-backend.yml)
        target: process.env.VITE_BACKEND_TARGET || 'http://bondvision-backend:3000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})
