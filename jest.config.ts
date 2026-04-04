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
  testMatch: ["**/src/**/__tests__/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "\\.claude/worktrees/", "tests/evals/"],
  setupFilesAfterEnv: ["jest-extended/all", "<rootDir>/jest.setup-after-env.ts"],
  setupFiles: ["<rootDir>/jest.setup.ts"],
  reporters: ["default", "<rootDir>/jest-failure-reporter.ts"],
  maxWorkers: 1,
  workerIdleMemoryLimit: '512MB', // Recycle worker to prevent OOM with ESM module loading
  testTimeout: 60000,
};

module.exports = config;
