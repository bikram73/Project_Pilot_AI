import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// Netlify-optimized Vite config with proper Tailwind CSS processing
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
    // Enable proper CSS processing with PostCSS and Tailwind
    css: {
      postcss: {
        plugins: [
          tailwindcss,
          autoprefixer,
        ],
      },
    },
  };
});