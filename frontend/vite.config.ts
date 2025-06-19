import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    preview: {
        host: true,
        port: 8080
    },
    build: {
        outDir: './build',
        emptyOutDir: true
    },
    server: {
        port: 8080,
        host: true,
        proxy: {
            '/api': {
                target: 'http://backend:5000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
}) 
