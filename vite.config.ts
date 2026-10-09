import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { cpSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/pdf-to-image/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'local-pdf-assets',
      buildStart() {
        for (const dir of ['cmaps', 'standard_fonts', 'wasm']) {
          cpSync(
            resolve('node_modules/pdfjs-dist', dir),
            resolve('public/pdfjs', dir),
            { recursive: true },
          );
        }
      },
    },
  ],
  build: { target: 'es2022' },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test-setup.ts'],
  },
});
