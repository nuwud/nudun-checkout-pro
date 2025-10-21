const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: [],
    include: ['__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    passWithNoTests: true,
    coverage: {
      reporter: ['text', 'html']
    }
  }
});
