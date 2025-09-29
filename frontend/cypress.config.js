const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here if needed
    },
    specPattern: 'cypress/integration/**/*.spec.js',
    supportFile: 'cypress/support/index.js'
  }
});
