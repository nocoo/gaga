import { readFileSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

function apiLivePlugin(): Plugin {
  const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
  const body = `${JSON.stringify({ status: 'ok', version })}\n`;
  return {
    name: 'api-live',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (new URL(req.url ?? '/', 'http://localhost').pathname !== '/api/live') return next();
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(req.method === 'HEAD' ? undefined : body);
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'api/live', source: body });
    },
  };
}

export default defineConfig({
  plugins: [apiLivePlugin()],
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
