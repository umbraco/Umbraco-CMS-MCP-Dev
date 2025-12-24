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

// Common tool sets for different test scenarios
export const TOOL_SETS = {
  dataType: [
    "create-data-type",
    "delete-data-type",
    "get-data-type-root",
    "get-data-type-property-editor-template",
    "find-data-type",
    "move-data-type",
    "create-data-type-folder",
    "delete-data-type-folder"
  ],
  documentType: [
    "create-document-type",
    "delete-document-type",
    "get-document-type",
    "get-all-document-types",
    "get-document-type-configuration"
  ],
  document: [
    "get-document-root",
    "get-document-by-id",
    "create-document",
    "delete-document",
    "update-document"
  ],
  basic: [
    "get-document-type-configuration",
    "get-document-root",
    "get-document-by-id",
    "create-data-type-folder",
    "get-data-type-root",
    "find-data-type",
    "move-data-type",
    "delete-data-type-folder"
  ]
} as const;

/**
 * Gets tool list as comma-separated string for UMBRACO_INCLUDE_TOOLS env var
 */
export function getToolsString(tools: readonly string[]): string {
  return [...tools].join(",");
}

/**
 * Combines multiple tool sets into a single string
 */
export function combineToolSets(...sets: (keyof typeof TOOL_SETS)[]): string {
  const allTools = new Set<string>();
  for (const set of sets) {
    for (const tool of TOOL_SETS[set]) {
      allTools.add(tool);
    }
  }
  return Array.from(allTools).join(",");
}
