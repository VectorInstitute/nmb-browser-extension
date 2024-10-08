import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const fetchVersion = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html) {
      return html.replace(
        /__APP_VERSION__/,
        `v${process.env.npm_package_version}`
      )
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), fetchVersion()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        background: new URL('./background.html', import.meta.url).pathname,
      },
    },
    target: 'esnext',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
})
