import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev rejimida /api va /uploads so'rovlari backend (3001-port)ga yo'naltiriladi
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3001', '/uploads': 'http://localhost:3001' } },
})
