import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './', // critical for file:// loading in WebView
  build: {
    target: 'es2018',
    outDir: 'dist',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    sourcemap: false,
  },
  server: {
    host: true, // so device can hit your LAN IP
    port: 5173,
  },
});
