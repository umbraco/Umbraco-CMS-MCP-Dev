/**
 * Eval Test Helpers
 *
 * Re-exports from @umbraco-cms/mcp-server-sdk/evals.
 * Configuration is set up in e2e-setup.ts.
 */

// Re-export everything from SDK evals
export {
  // Configuration
  configureEvals,
  getEvalConfig,
  getMcpServerPath,
  getMcpServerName,
  getServerEnv,
  getDefaultModel,
  getDefaultMaxTurns,
  getDefaultMaxBudgetUsd,
  getDefaultTimeoutMs,
  getDefaultVerbosity,
  getToolsString,
  getVerbosity,
  type VerbosityLevel,
  type EvalConfig,

  // Types
  type AgentTestResult,
  type ToolCall,
  type AgentTestOptions,
  type ToolVerificationResult,
  type TestScenario,

  // Agent runner
  runAgentTest,
  getShortToolName,
  getFullToolName,
  formatToolCalls,
  logTestResult,

  // Verification helpers
  verifyRequiredToolCalls,
  verifySuccessMessage,
  verifyMcpConnection,
  verifyToolsAvailable,
  verifyToolCalledWithParams,
  getToolCalls,
  assertTestPassed,

  // Scenario runner
  runScenarioTest,
  setupConsoleMock,

  // Model constants
  ClaudeModels,
} from "@umbraco-cms/mcp-server-sdk/evals";
