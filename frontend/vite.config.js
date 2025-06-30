import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    allowedHosts: ['podman.losvernos.com'], // or ['.losvernos.com'] for a wildcard
  },
});