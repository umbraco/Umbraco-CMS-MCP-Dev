import type { VerbosityLevel } from "./config.js";

/**
 * E2E SDK Test Types
 *
 * Shared TypeScript interfaces and types for Agent SDK tests.
 */

/**
 * Result of running an agent test
 */
export interface AgentTestResult {
  /** All tool calls made during the test */
  toolCalls: ToolCall[];
  /** Results from each tool call */
  toolResults: unknown[];
  /** The agent's final text response */
  finalResult: string;
  /** Whether the agent completed successfully */
  success: boolean;
  /** Total cost in USD */
  cost: number;
  /** Number of conversation turns */
  turns: number;
  /** List of available tools from init message */
  availableTools: string[];
  /** Token usage */
  tokens: {
    input: number;
    output: number;
    total: number;
  };
}

/**
 * A single tool call made by the agent
 */
export interface ToolCall {
  /** Full tool name including MCP prefix */
  name: string;
  /** Tool input parameters */
  input: unknown;
}

/**
 * Options for running an agent test
 */
export interface AgentTestOptions {
  /** Maximum conversation turns (default: 15) */
  maxTurns?: number;
  /** Maximum budget in USD (default: 0.50) */
  maxBudget?: number;
  /** Model to use (default: claude-haiku-4-5-20251001) */
  model?: string;
  /** @deprecated Use verbosity instead */
  verbose?: boolean;
  /** Output verbosity level */
  verbosity?: VerbosityLevel;
}

/**
 * Result of verifying required tool calls
 */
export interface ToolVerificationResult {
  /** Whether all required tools were called */
  passed: boolean;
  /** List of tools that were not called */
  missing: string[];
  /** List of tools that were called */
  called: string[];
}

/**
 * Configuration for a test scenario
 */
export interface TestScenario {
  /** Name of the test */
  name: string;
  /** Prompt to send to the agent */
  prompt: string;
  /** Tools to make available */
  tools: string | readonly string[] | string[];
  /** Tools that must be called for the test to pass */
  requiredTools: readonly string[] | string[];
  /** Optional: expected success message pattern */
  successPattern?: RegExp | string;
  /** Log full conversation trace (assistant messages, tool calls, tool results) */
  verbose?: boolean;
  /** Alias for verbose - log full conversation trace */
  debug?: boolean;
  /** Output verbosity level (overrides verbose/debug) */
  verbosity?: VerbosityLevel;
  /** Optional: test options override */
  options?: AgentTestOptions;
}
