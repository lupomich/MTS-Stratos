import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3002,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'bondvision-digital',
      'host.docker.internal'
    ],
    proxy: {
      '/api': {
        target: 'http://bondvision-backend:3000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    },
    hmr: {
      host: 'bondvision-digital',
      port: 3002,
      protocol: 'http'
    }
  }
})
