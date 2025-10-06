import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'three/webgpu': path.resolve(__dirname, './src/lib/three-webgpu-stub.ts'),
    },
    dedupe: ['three', 'react', 'react-dom'],
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    exclude: ['three/webgpu'],
  },
})
