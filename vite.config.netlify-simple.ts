import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Ultra-simple Vite config for Netlify - no PostCSS, no Tailwind plugins
export default defineConfig(() => {
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: true,
      rollupOptions: {
        input: path.resolve(__dirname, 'index-netlify.html'),
        output: {
          manualChunks: undefined,
        },
      },
    },
    // Completely disable CSS processing to avoid any PostCSS issues
    css: {
      postcss: false,
    },
  };
});