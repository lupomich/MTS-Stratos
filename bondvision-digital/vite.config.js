import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3002,
    hmr: {
      host: 'localhost',
      port: 3002
    },
    origin: 'http://host.docker.internal:3002'
  }
})
