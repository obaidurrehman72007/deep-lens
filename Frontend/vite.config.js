import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  base: "/",
  server: {
    proxy: {
      // Directs all /api requests to your Express server
      '/api': {
        target: process.env.FRONTEND_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  }
})
