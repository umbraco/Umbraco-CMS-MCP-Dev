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

/**
 * Sets the connected Umbraco server version so collection registrations can
 * gate tools that depend on endpoints introduced in newer Umbraco releases.
 * Mirrors what src/index.ts (the stdio entry point) calls at startup; an
 * in-process consumer should call this with the connected server's version
 * before building its tool list.
 */
export declare function setUmbracoVersion(version: string | null | undefined): void;

/**
 * Controls whether the filePath upload source is exposed in media upload
 * tools. Defaults to false; set to true only where local filesystem access
 * is actually available (as src/index.ts does for the Node/stdio entry
 * point).
 */
export declare function setAllowFilePathUploads(allow: boolean): void;

export declare class UmbracoManagementClient {
  private constructor();
  static getClient(): unknown;
}
