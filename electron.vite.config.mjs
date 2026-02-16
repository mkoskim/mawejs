import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: './electron/electron.js'
        }
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: './electron/preload/services.js'
        }
      }
    }
  },
  renderer: {
    root: "./src",
    build: {
      rollupOptions: {
        input: {
          index: './src/index.html'
        }
      }
    },
    plugins: [
      react()
    ],
  },
})
