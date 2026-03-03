import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  base: '/Alrwid-Property-Manager_frontend/',
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: [
      // More specific first so @/components/ui/sidebar -> src/components/Components/ui/sidebar
      { find: '@/components', replacement: path.resolve(__dirname, 'src/components/Components') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
})
