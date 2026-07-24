/**
 * Pure helper functions for block structure discovery and traversal.
 * Used by update-block-property tool to navigate BlockList, BlockGrid, and RichText blocks.
 */

/**
 * Represents a single block data item within a BlockList, BlockGrid, or RichText structure.
 */
export interface BlockDataItem {
  key: string;
  contentTypeKey: string;
  values: Array<{
    alias: string;
    culture?: string | null;
    segment?: string | null;
    value?: any;
    editorAlias?: string;
  }>;
}

/**
 * Represents a discovered set of block arrays with their location path.
 */
export interface DiscoveredBlockArrays {
  contentData: BlockDataItem[];
  settingsData: BlockDataItem[];
  path: string;
}

/**
 * Result of finding a block by key.
 */
export interface FoundBlock {
  block: BlockDataItem;
  arrayRef: BlockDataItem[];
  path: string;
}

/**
 * Checks if a value is a RichText structure.
 * RichText values have: { markup: "...", blocks: { layout: {}, contentData: [], settingsData: [], expose: [] } }
 *
 * @param value - The value to check
 * @returns true if the value is a RichText structure
 */
export function isRichTextValue(value: any): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (!("markup" in value)) {
    return false;
  }
  if (!value.blocks || typeof value.blocks !== "object") {
    return false;
  }
  return Array.isArray(value.blocks.contentData) && Array.isArray(value.blocks.settingsData);
}

/**
 * Checks if a value is a BlockList/BlockGrid structure (has contentData and settingsData arrays).
 *
 * @param value - The value to check
 * @returns true if the value has block structure
 */
export function isBlockStructure(value: any): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }
  return Array.isArray(value.contentData) && Array.isArray(value.settingsData);
}

/**
 * Recursively discovers all block arrays (contentData and settingsData) in a value structure.
 * This handles nested blocks in RichText editors and deeply nested block structures.
 *
 * @param value - The value to search within
 * @param path - The current path (for debugging/error messages)
 * @returns Array of discovered block arrays with their paths
 */
export function discoverAllBlockArrays(value: any, path: string = "root"): DiscoveredBlockArrays[] {
  const results: DiscoveredBlockArrays[] = [];

  // Base case: null, undefined, or not an object
  if (!value || typeof value !== "object") {
    return results;
  }

  // Check for RichText structure at the top level (document property is an RTE)
  // This handles the case where the document property itself is an RTE
  if (isRichTextValue(value)) {
    const nestedResults = discoverAllBlockArrays(value.blocks, `${path}.blocks`);
    results.push(...nestedResults);
    return results;
  }

  // Check if this value has contentData and settingsData arrays (BlockList/BlockGrid or blocks from RTE)
  if (isBlockStructure(value)) {
    results.push({
      contentData: value.contentData,
      settingsData: value.settingsData,
      path
    });

    // Now recursively check each block in contentData for nested structures
    value.contentData.forEach((block: BlockDataItem, index: number) => {
      if (block.values && Array.isArray(block.values)) {
        block.values.forEach((prop: any, propIndex: number) => {
          const propPath = `${path}.contentData[${index}].values[${propIndex}](${prop.alias})`;

          // Check for RichText blocks structure (nested RTE inside blocks)
          if (isRichTextValue(prop.value)) {
            const nestedResults = discoverAllBlockArrays(prop.value.blocks, `${propPath}.blocks`);
            results.push(...nestedResults);
          }
          // Check for direct nested block structures (BlockList/BlockGrid nested inside blocks)
          else if (isBlockStructure(prop.value)) {
            const nestedResults = discoverAllBlockArrays(prop.value, propPath);
            results.push(...nestedResults);
          }
        });
      }
    });

    // Check settingsData blocks too
    value.settingsData.forEach((block: BlockDataItem, index: number) => {
      if (block.values && Array.isArray(block.values)) {
        block.values.forEach((prop: any, propIndex: number) => {
          const propPath = `${path}.settingsData[${index}].values[${propIndex}](${prop.alias})`;

          // Check for RichText blocks structure (nested RTE inside blocks)
          if (isRichTextValue(prop.value)) {
            const nestedResults = discoverAllBlockArrays(prop.value.blocks, `${propPath}.blocks`);
            results.push(...nestedResults);
          }
          // Check for direct nested block structures (BlockList/BlockGrid nested inside blocks)
          else if (isBlockStructure(prop.value)) {
            const nestedResults = discoverAllBlockArrays(prop.value, propPath);
            results.push(...nestedResults);
          }
        });
      }
    });
  }

  return results;
}

/**
 * Find a block by contentKey across all discovered block arrays.
 *
 * @param discoveredArrays - Array of discovered block structures
 * @param contentKey - The UUID key identifying the block
 * @param blockType - Whether to search in "content" or "settings" data
 * @returns The found block with its array reference and path, or null if not found
 */
export function findBlockByKey(
  discoveredArrays: DiscoveredBlockArrays[],
  contentKey: string,
  blockType: "content" | "settings"
): FoundBlock | null {
  for (const discovered of discoveredArrays) {
    const array = blockType === "content" ? discovered.contentData : discovered.settingsData;
    const block = array.find((b: BlockDataItem) => b.key === contentKey);
    if (block) {
      return { block, arrayRef: array, path: discovered.path };
    }
  }
  return null;
}
