const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        numTestsKeptInMemory: 1,
        experimentalMemoryManagement: true,
    },
});
