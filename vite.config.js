import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/Ghid_Studii_AI/',
  plugins: [react(), tailwindcss()],
  // PGlite loads its own WASM and data files relative to its module URL; pre-bundling would break that
  optimizeDeps: { exclude: ['@electric-sql/pglite'] },
  worker: { format: 'es' },
})
