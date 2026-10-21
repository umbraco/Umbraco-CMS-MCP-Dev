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

export { availableCollections as collections } from "./umbraco-api/tools/collection-registry.js";
export { allModes, allModeNames } from "./config/mode-registry.js";
export { allSliceNames } from "./config/slice-registry.js";
export { UmbracoManagementClient } from "./umbraco-api/umbraco-management-client.js";
export { configureApiClient, initializeUmbracoFetch } from "@umbraco-cms/mcp-server-sdk";

// Runtime setup that src/index.ts (the stdio entry point) performs before
// building the tool list. In-process consumers that import this module
// instead of spawning the stdio process (e.g. Forms in-process chaining, or
// a host combining several products' collections in one process) need to
// reproduce that same setup themselves, so it must be reachable from here
// too. See #563.
export { setUmbracoVersion, setAllowFilePathUploads } from "./umbraco-api/runtime-context.js";
