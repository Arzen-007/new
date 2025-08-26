import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // This will expose the server to the network
    port: 5174, // Ensure this matches the exposed port
    strictPort: true,
    hmr: { // Hot Module Replacement settings
      clientPort: 443, // Use 443 for HTTPS if proxying
    },
    // Add the public URL to allowedHosts
    // Replace with the actual public URL provided by service_expose_port
    allowedHosts: [
      '5174-ik9j4p8mde4bb30gmmtfq-c52023d0.manusvm.computer',
      '5174-iyb3v2aepepfr604zyvi5-c52023d0.manusvm.computer',
      'localhost',
      '127.0.0.1'
    ]
  }
})
