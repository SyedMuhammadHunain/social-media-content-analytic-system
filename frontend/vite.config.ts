import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react'
          }
          if (id.includes('@heroicons')) {
            return 'vendor-icons'
          }
          if (id.includes('@astryxdesign/theme-')) {
            return 'vendor-astryx-theme'
          }
          if (id.includes('@astryxdesign/')) {
            return 'vendor-astryx-core'
          }
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'vendor-charts'
          }
        },
      },
    },
  },
})
