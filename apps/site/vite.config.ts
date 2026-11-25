import { defineConfig } from 'vite';
import solid from '@solidjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [
    solid(),
    tailwindcss()
  ],
  server: {
    port: 3001,
    host: '0.0.0.0'
  },
  build: {
    target: 'esnext',
    outDir: 'dist'
  }
});
