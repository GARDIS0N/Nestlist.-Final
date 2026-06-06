import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
      host: true,
      port: 3000,
      watch: {
        ignored: [
          '**/src/data/**',
          '**/uploads/**',
          '**/database.json'
        ]
      }
    },
  };
});
