import { defineConfig } from 'vite';

export default defineConfig({
  server: { host: true, port: 5177 },
  preview: { host: true, port: 4177 },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/three/build/three.core.js')) return 'three-core';
          if (id.includes('/three/build/three.module.js')) return 'three-renderer';
          if (id.includes('/three/examples/')) return 'three-addons';
        },
      },
    },
  },
});
