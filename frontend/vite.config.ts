import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // The browser calls /api on this dev server and Vite forwards it to FastAPI.
    // One origin for the browser means the strict session cookie is sent and no CORS is needed.
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
})
