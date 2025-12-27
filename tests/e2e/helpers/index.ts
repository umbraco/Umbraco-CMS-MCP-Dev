/**
 * E2E SDK Test Helpers
 *
 * Central export for all e2e-sdk test utilities.
 *
 * Usage:
 * ```typescript
 * import {
 *   createScenarioTest,
 *   setupConsoleMock
 * } from "./helpers/index.js";
 * ```
 */

// Configuration
export {
  MCP_SERVER_PATH,
  MCP_SERVER_NAME,
  UMBRACO_CLIENT_ID,
  UMBRACO_CLIENT_SECRET,
  UMBRACO_BASE_URL,
  DEFAULT_MODEL,
  DEFAULT_MAX_TURNS,
  DEFAULT_MAX_BUDGET_USD,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_VERBOSITY,
  getToolsString,
  getVerbosity,
  type VerbosityLevel
} from "./config.js";

// Types
export type {
  AgentTestResult,
  ToolCall,
  AgentTestOptions,
  ToolVerificationResult,
  TestScenario
} from "./types.js";

// Agent runner
export {
  runAgentTest,
  getShortToolName,
  getFullToolName,
  formatToolCalls,
  logTestResult
} from "./agent-runner.js";

// Verification helpers
export {
  verifyRequiredToolCalls,
  verifySuccessMessage,
  verifyMcpConnection,
  verifyToolsAvailable,
  verifyToolCalledWithParams,
  getToolCalls,
  assertTestPassed
} from "./verification.js";

// Scenario runner (high-level test creation)
export {
  createScenarioTest,
  setupConsoleMock
} from "./scenario-runner.js";

// Rate limiter
export {
  rateLimiter,
  waitForRateLimit,
  recordTokenUsage
} from "./rate-limiter.js";
