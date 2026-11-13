import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works at any GitHub Pages path (e.g. /connect-forger/).
  base: './',
  worker: { format: 'es' },
});
