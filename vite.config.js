import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // The Butterbase SDK's shared quota module imports randomUUID from
      // node:crypto, which has no browser build. Map it to a Web Crypto shim.
      'node:crypto': fileURLToPath(new URL('./src/shims/node-crypto.js', import.meta.url)),
    },
  },
  server: {
    port: 5273,
    host: true,
  },
})
