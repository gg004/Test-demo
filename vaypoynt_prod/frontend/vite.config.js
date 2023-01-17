import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig( {
  plugins: [ react() ],
  resolve: {
    alias: {
      'Components': path.resolve( __dirname, './src/components' ),
      'Pages': path.resolve( __dirname, './src/pages' ),
      'Utils': path.resolve( __dirname, './src/utils' ),
      'Assets': path.resolve( __dirname, './src/assets' ),
      // '@': path.resolve(__dirname, './src'),
    },
  },
} )
