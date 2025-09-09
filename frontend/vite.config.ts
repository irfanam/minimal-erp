import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Ensure only one React instance (avoids hooks/context mismatches)
    dedupe: ['react', 'react-dom']
  },
  server: {
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      // Prefer the conventional dev port; Vite auto-falls back if busy.
      port: 5173
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // rewrite: path => path
      }
    }
  }
})
