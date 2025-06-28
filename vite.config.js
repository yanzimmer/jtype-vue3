import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'ant-design': ['ant-design-vue']
        }
      }
    }
  }
})
