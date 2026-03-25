// Allow self-signed certificates for local Umbraco dev instances.
// Must be set here (before any modules load) because Jest's VM modules
// may initialize TLS before setupFiles run.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const config: import("ts-jest").JestConfigWithTsJest = {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@/config\\.js$": "<rootDir>/src/config.ts",
    "^@/clients/(.*)\\.js$": "<rootDir>/src/clients/$1",
    "^@/helpers/(.*)\\.js$": "<rootDir>/src/helpers/$1",
    "^@/constants/(.*)\\.js$": "<rootDir>/src/constants/$1",
    "^@/umb-management-api/(.*)\\.js$":
      "<rootDir>/src/umb-management-api/api/$1",
    "^@umb-management-client":
      "<rootDir>/src/umb-management-api/umbraco-management-client.ts",
    "^auth/(.*)\\.js$": "<rootDir>/src/auth/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  testMatch: ["**/src/**/__tests__/**/*.test.ts", "**/tests/evals/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
  setupFilesAfterEnv: ["jest-extended/all"],
  setupFiles: ["<rootDir>/jest.setup.ts"],
  maxConcurrency: 1, // Umbraco uses SQLite which doesn't support concurrent connections
  maxWorkers: 1,
  testTimeout: 60000, // 60 second timeout for integration tests
};

module.exports = config;
