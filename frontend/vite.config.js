import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Open the root path in the browser when `npm run dev` starts
    open: '/',
  },
})
