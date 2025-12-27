import type { Config } from "jest";

/**
 * Jest configuration for e2e-sdk tests
 *
 * This config extends the main jest config but customizes settings
 * for long-running e2e tests:
 * - Higher timeout (120s)
 * - Disabled slow test warnings
 * - Silent mode for clean output (controlled by scenario-runner)
 */
const config: Config = {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  rootDir: "../..",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "\\.md$": "<rootDir>/src/__mocks__/markdownMock.js",
    "^@/config\\.js$": "<rootDir>/src/config.ts",
    "^@/clients/(.*)\\.js$": "<rootDir>/src/clients/$1",
    "^@/helpers/(.*)\\.js$": "<rootDir>/src/helpers/$1",
    "@/test-helpers/(.*)\\.js$": "<rootDir>/src/test-helpers/$1",
    "^@/constants/(.*)\\.js$": "<rootDir>/src/constants/$1",
    "^@/umb-management-api/(.*)\\.js$": "<rootDir>/src/umb-management-api/api/$1",
    "^@umb-management-client": "<rootDir>/src/umb-management-api/umbraco-management-client.ts",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  testMatch: ["<rootDir>/tests/e2e/**/*.test.ts"],
  setupFilesAfterEnv: [
    "jest-extended/all",
    "<rootDir>/tests/e2e/helpers/e2e-setup.ts"
  ],
  setupFiles: ["<rootDir>/jest.setup.ts"],

  // E2E specific settings
  maxConcurrency: 1,
  maxWorkers: 1,
  testTimeout: 120000, // 2 minute timeout for long-running tests

  // Disable slow test warnings (these are expected to be slow)
  slowTestThreshold: 300, // 5 minutes - effectively disables the warning
};

export default config;
