import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    environmentMatchGlobs: [
      // Server-side tests use Node environment, not jsdom
      ['tests/server/**', 'node'],
      ['tests/lib/**', 'node'],
      ['tests/integration/**', 'node'],
    ],
    env: loadEnv('test', process.cwd(), ''),
  },
})
