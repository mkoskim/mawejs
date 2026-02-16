import { resolve } from 'path'
import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: './public/electron.js'
        }
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: './public/preload/services.js'
        }
      }
    }
  },
  renderer: {
    root: "./src",
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/index.html')
        }
      }
    },
    plugins: [
/*
      {
        name: 'treat-js-files-as-jsx',
        async transform(code, id) {
          if (!id.match(/src\/.*\.js$/))  return null

          // Use the exposed transform from vite, instead of directly
          // transforming with esbuild
          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic',
          })
        },
      },
/**/
      react()
    ],
  },
})
