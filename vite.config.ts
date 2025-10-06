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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js into separate chunk
          'three': ['three', 'three-spritetext'],
          // Split react-force-graph
          'graph': ['react-force-graph-3d', 'd3-force-3d'],
          // Split vendor libraries
          'vendor': ['react', 'react-dom', 'zustand'],
          // Split D3 utilities
          'd3': ['d3-scale', 'd3-scale-chromatic'],
        },
      },
    },
    // Enable minification
    minify: 'terser',
    // Chunk size warning threshold
    chunkSizeWarningLimit: 500, // 500KB
  },
})
