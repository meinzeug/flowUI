import { defineConfig } from 'vitest/config'
export default defineConfig({
  root: '.',
  test: {
    include: ['WebSocketService.test.ts'],
    environment: 'jsdom'
  }
})
