import { defineConfig } from 'vite';
import { resolve } from 'path';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  return {
    server: {
      port: 3450
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    plugins: [react(), svgr(), crx({ manifest })],
    build: {
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'popup.html'),
          settings: resolve(__dirname, 'settings.html')
        }
      },
      sourcemap: mode === 'production' ? 'hidden' : true,
      emptyOutDir: true
    }
  };
});
