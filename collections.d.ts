/**
 * Type declarations for the collections entry point.
 *
 * The CMS package has dts: false in tsup (DTS generation is slow with 500+ tools),
 * so this hand-written file provides types for consumers that import from
 * "@umbraco-cms/mcp-dev/collections" (e.g., Forms in-process chaining).
 */
import type { ToolCollectionExport, ToolModeDefinition } from "@umbraco-cms/mcp-server-sdk";

export declare const collections: ToolCollectionExport[];
export declare const allModes: ToolModeDefinition[];
export declare const allModeNames: readonly string[];
export declare const allSliceNames: readonly string[];

export declare class UmbracoManagementClient {
  private constructor();
  static getClient(): unknown;
}
