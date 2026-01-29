/**
 * Configuration registries for the Umbraco MCP Server.
 *
 * Slice and mode registries define the tool categorization and filtering options.
 * Utilities for config loading and filtering are imported from @umbraco-cms/mcp-server-sdk.
 */

export {
  toolSliceNames,
  allSliceNames,
} from "./slice-registry.js";

export type {
  ToolSliceName,
  ExtendedSliceName,
} from "./slice-registry.js";

export {
  baseModes,
  allModes,
  allModeNames,
} from "./mode-registry.js";

export {
  loadServerConfig,
  clearConfigCache,
} from "./server-config.js";

export type {
  ServerConfig,
  CustomServerConfig,
} from "./server-config.js";
