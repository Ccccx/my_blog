import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/my_blog/',
  server: {
    proxy: {
      '/api/daily-brief': {
        target: 'https://news.learnprompt.pro',
        changeOrigin: true,
        rewrite: () => '/data/daily-brief.json',
      },
    },
  },
})
