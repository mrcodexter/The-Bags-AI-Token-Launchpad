import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    global: 'window',
  },
  resolve: {
    alias: {
      'cross-fetch': path.resolve(__dirname, './src/fetch-shim.ts'),
      'node-fetch': path.resolve(__dirname, './src/fetch-shim.ts'),
      'isomorphic-fetch': path.resolve(__dirname, './src/fetch-shim.ts'),
      'whatwg-fetch': path.resolve(__dirname, './src/fetch-shim.ts'),
      'cross-fetch/polyfill': path.resolve(__dirname, './src/fetch-shim.ts'),
      'isomorphic-fetch/polyfill': path.resolve(__dirname, './src/fetch-shim.ts'),
      'node-fetch-native': path.resolve(__dirname, './src/fetch-shim.ts'),
      'unfetch': path.resolve(__dirname, './src/fetch-shim.ts'),
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
