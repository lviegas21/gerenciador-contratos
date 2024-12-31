import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: path.join(__dirname, 'client'),
  build: {
    outDir: path.join(__dirname, 'dist')
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
