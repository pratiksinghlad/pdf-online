import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import checker from "vite-plugin-checker";
import viteCompression from "vite-plugin-compression";
import wasm from "vite-plugin-wasm";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    process.env.NODE_ENV === "production" ? null : checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}" --max-warnings=0',
        dev: {
          logLevel: ["error"],
        },
        useFlatConfig: true,
      },
      overlay: false,
    }),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024,
    }),
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 1024,
    }),
    wasm()
  ].filter(Boolean),
  server: {
    port: 3001,
    strictPort: true,
    host: process.env.TAURI_DEV_HOST || false,
    hmr: process.env.TAURI_DEV_HOST
      ? {
          protocol: "ws",
          host: process.env.TAURI_DEV_HOST,
          port: 5183,
        }
      : undefined,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ["**/*.jpg", "**/*.png", "**/*.svg", "**/*.gif", "**/*.webp"],
  base: process.env.TAURI_ENV_PLATFORM ? './' : '/pdf-online/',
  
  clearScreen: false,
  
  build: {
    // Code splitting for optimal bundle size
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react') || 
              id.includes('react-dom') || 
              id.includes('react-router-dom') ||
              id.includes('@chakra-ui') || 
              id.includes('@emotion') ||
              id.includes('framer-motion')
            ) {
              return 'vendor-ui';
            }
            if (id.includes('pdf-lib')) {
              return 'lib-pdflib';
            }
            if (id.includes('pdfjs-dist')) {
              return 'lib-pdfjs';
            }
            if (id.includes('@dnd-kit')) {
              return 'lib-dnd';
            }
            return 'vendor-others';
          }
          if (id.includes('src/features/')) {
             const feature = id.split('src/features/')[1].split('/')[0];
             return `feature-${feature}`;
          }
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Enable minification
    minify: 'esbuild',
    // Source maps for production debugging
    sourcemap: true,
    // Target modern browsers
    target: 'esnext',
  },
// Worker configuration
  worker: {
    format: 'es',
    plugins: () => [wasm()],
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@chakra-ui/react', 'pdf-lib'],
    exclude: ['pdfjs-dist'], // Lazy load this as it's large and has its own worker
  },
});
