import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    css: {
      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: true,
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  };
});