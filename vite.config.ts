import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Code splitting for optimal bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chakra-vendor': ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
          'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          // Heavy PDF libs - lazy loaded
          'pdf-lib': ['pdf-lib'],
          'pdfjs': ['pdfjs-dist'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Enable minification
    minify: 'esbuild',
    // Source maps for production debugging
    sourcemap: false,
    // Target modern browsers
    target: 'esnext',
  },
  // Worker configuration
  worker: {
    format: 'es',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', '@chakra-ui/react', 'pdf-lib'],
    exclude: ['pdfjs-dist'], // Lazy load this as it's large and has its own worker
  },
});
