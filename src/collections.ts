/**
 * Tool Collections Export
 *
 * Lightweight entry point for in-process chaining.
 * Import this from another MCP server to chain CMS tools without spawning a process.
 *
 * @example
 * ```typescript
 * import { collections, allModes, allModeNames, allSliceNames } from "@umbraco-cms/mcp-dev/collections";
 *
 * manager.registerServer({
 *   transport: "in-process",
 *   name: "cms",
 *   collections,
 *   modeRegistry: allModes,
 *   allModeNames,
 *   allSliceNames,
 * });
 * ```
 */

export { availableCollections as collections } from "./umb-management-api/tools/collection-registry.js";
export { allModes, allModeNames } from "./config/mode-registry.js";
export { allSliceNames } from "./config/slice-registry.js";
export { UmbracoManagementClient } from "./umb-management-api/umbraco-management-client.js";
