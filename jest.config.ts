const config: import("ts-jest").JestConfigWithTsJest = {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "\\.md$": "<rootDir>/src/__mocks__/markdownMock.js",
    "^@/config\\.js$": "<rootDir>/src/config.ts",
    "^@/clients/(.*)\\.js$": "<rootDir>/src/clients/$1",
    "^@/helpers/(.*)\\.js$": "<rootDir>/src/helpers/$1",
    "^@/constants/(.*)\\.js$": "<rootDir>/src/constants/$1",
    "^@/umb-management-api/(.*)\\.js$":
      "<rootDir>/src/umb-management-api/api/$1",
    "^@umb-management-client":
      "<rootDir>/src/umb-management-api/umbraco-management-client.ts",
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
  setupFilesAfterEnv: ["jest-extended/all"],
  setupFiles: ["<rootDir>/jest.setup.ts"],
  maxConcurrency: 1, // we have to this because Umbraco using SQLite and it doesn't support concurrent connections
  maxWorkers: 1,
  testTimeout: 60000, // 60 second timeout for integration tests
};

module.exports = config;
