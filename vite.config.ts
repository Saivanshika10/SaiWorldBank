import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react(), tailwindcss()],

    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // ✅ IMPORTANT FOR DEPLOYMENT
    build: {
      outDir: 'dist',
    },

    // ✅ ONLY FOR LOCAL DEV (SAFE TO KEEP)
    server: {
      hmr: true,
      proxy: {
        '/api': 'http://localhost:3000',
      },
    },
  };
});
