import path from "path";

/**
 * E2E SDK Test Configuration
 *
 * Centralized configuration for Agent SDK tests.
 * Environment variables can override defaults.
 */

// MCP Server configuration
export const MCP_SERVER_PATH = path.resolve(process.cwd(), "dist/index.js");
export const MCP_SERVER_NAME = "umbraco-mcp";

// Umbraco connection settings
export const UMBRACO_CLIENT_ID = process.env.UMBRACO_CLIENT_ID || "umbraco-back-office-mcp";
export const UMBRACO_CLIENT_SECRET = process.env.UMBRACO_CLIENT_SECRET || "1234567890";
export const UMBRACO_BASE_URL = process.env.UMBRACO_BASE_URL || "http://localhost:56472";

// Agent SDK defaults
export const DEFAULT_MODEL = "claude-3-5-haiku-20241022";
export const DEFAULT_MAX_TURNS = 15;
export const DEFAULT_MAX_BUDGET_USD = 0.50;
export const DEFAULT_TIMEOUT_MS = 120000;

/**
 * Verbosity levels for test output:
 * - "quiet": Minimal output (just pass/fail per test, summary at end)
 * - "normal": Standard output with tools called, cost info
 * - "verbose": Full conversation trace with all messages
 */
export type VerbosityLevel = "quiet" | "normal" | "verbose";

/**
 * Default verbosity level. Set E2E_VERBOSITY env var to override.
 * Options: quiet, normal, verbose
 */
export const DEFAULT_VERBOSITY: VerbosityLevel =
  (process.env.E2E_VERBOSITY as VerbosityLevel) || "quiet";

/**
 * Gets tool list as comma-separated string for UMBRACO_INCLUDE_TOOLS env var
 */
export function getToolsString(tools: readonly string[]): string {
  return [...tools].join(",");
}

/**
 * Gets the effective verbosity level from options
 */
export function getVerbosity(options?: { verbose?: boolean; verbosity?: VerbosityLevel }): VerbosityLevel {
  // Explicit verbosity takes precedence
  if (options?.verbosity) {
    return options.verbosity;
  }
  // Legacy verbose flag maps to "verbose"
  if (options?.verbose) {
    return "verbose";
  }
  return DEFAULT_VERBOSITY;
}
