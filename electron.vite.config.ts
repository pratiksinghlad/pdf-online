import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: 'electron/main.ts'
      },
      minify: 'esbuild',
      bytecode: true
    }
  },
  preload: {
    build: {
      lib: {
        entry: 'electron/preload.ts',
        formats: ['cjs'],
        fileName: () => 'preload.cjs'
      },
      minify: 'esbuild',
      rollupOptions: {
        output: {
          format: 'cjs',
          entryFileNames: '[name].cjs'
        }
      },
      bytecode: false
    }
  },
  renderer: {
    root: '.',
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: {
          index: 'index.html',
          splash: 'electron/splash.html'
        }
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': 'src'
      }
    }
  }
})
