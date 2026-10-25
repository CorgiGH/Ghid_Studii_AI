import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    testTimeout: 60000,
    hookTimeout: 60000, // the beforeAll hooks boot a PGlite engine, which passes 10 s on a loaded runner
    reporters: ['default'],
  },
})
