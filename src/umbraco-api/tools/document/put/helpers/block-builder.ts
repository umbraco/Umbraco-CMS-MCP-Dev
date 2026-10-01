/**
 * Pure helper functions for building and removing blocks in BlockList, BlockGrid, and RichText
 * property values. Used by create-document-block and delete-document-block.
 *
 * Ported from Umbraco-CMS-MCP-Editor's block-builder (buildBlockEntry, insertAtPosition,
 * removeBlockFromContainer, isBlockListOrGridValue, isRteWithBlocks), adapted to this repo's
 * DiscoveredBlockArrays shape. Nothing in here calls the Management API.
 */

import {
  discoverAllBlockArrays,
  isBlockStructure,
  isRichTextValue,
  type BlockDataItem,
  type BlockExposeItem,
  type DiscoveredBlockArrays
} from "./block-discovery.js";

export type BlockEditorKind = "BlockList" | "BlockGrid" | "RichText";

/**
 * Property editor alias per block editor kind. This is also the key used in the value's `layout` object.
 */
export const BLOCK_EDITOR_ALIASES: Record<BlockEditorKind, string> = {
  BlockList: "Umbraco.BlockList",
  BlockGrid: "Umbraco.BlockGrid",
  RichText: "Umbraco.RichText",
};

export const DEFAULT_GRID_COLUMN_SPAN = 12;
export const DEFAULT_GRID_ROW_SPAN = 1;

export type BlockPlacement =
  | { position: "append" | "prepend"; contentKey?: string | null }
  | { position: "before" | "after"; contentKey: string };

export interface BlockPropertyValueInput {
  alias: string;
  value?: unknown;
  culture?: string | null;
  segment?: string | null;
}

/**
 * A BlockGrid area as configured on a block type in the data type configuration.
 */
export interface BlockGridAreaConfiguration {
  key: string;
  alias?: string;
  columnSpan?: number;
  rowSpan?: number;
  minAllowed?: number | null;
  maxAllowed?: number | null;
  specifiedAllowance?: Array<{
    elementTypeKey?: string | null;
    groupKey?: string | null;
    minAllowed?: number | null;
    maxAllowed?: number | null;
  }>;
}

/**
 * A block type as configured in a BlockList/BlockGrid/RichText data type's `blocks` configuration value.
 */
export interface BlockTypeConfiguration {
  contentElementTypeKey: string;
  settingsElementTypeKey?: string | null;
  label?: string;
  groupKey?: string | null;
  allowAtRoot?: boolean;
  allowInAreas?: boolean;
  displayInline?: boolean;
  areas?: BlockGridAreaConfiguration[];
}

/**
 * A BlockGrid layout item. BlockList/RichText layout items only use contentKey/settingsKey.
 */
export interface BlockLayoutItem {
  contentKey: string;
  settingsKey?: string | null;
  columnSpan?: number;
  rowSpan?: number;
  areas?: Array<{ key: string; items: BlockLayoutItem[] }>;
  [extra: string]: unknown;
}

/**
 * Where a layout item lives: the array that holds it, its index, and (for BlockGrid area items)
 * the parent layout item and area key.
 */
export interface LayoutLocation {
  items: BlockLayoutItem[];
  index: number;
  entry: BlockLayoutItem;
  parent?: BlockLayoutItem;
  areaKey?: string;
}

/**
 * Maps a property editor alias to the block editor kind, or null if it isn't a block editor.
 */
export function getBlockEditorKind(editorAlias: string | null | undefined): BlockEditorKind | null {
  switch (editorAlias) {
    case BLOCK_EDITOR_ALIASES.BlockList:
      return "BlockList";
    case BLOCK_EDITOR_ALIASES.BlockGrid:
      return "BlockGrid";
    case BLOCK_EDITOR_ALIASES.RichText:
      return "RichText";
    default:
      return null;
  }
}

/**
 * True for a BlockList/BlockGrid value (contentData/settingsData arrays at the top level).
 */
export function isBlockListOrGridValue(value: unknown): boolean {
  return isBlockStructure(value) && !isRichTextValue(value);
}

/**
 * True for a RichText value carrying a block structure under `blocks`.
 */
export function isRteWithBlocks(value: unknown): boolean {
  return isRichTextValue(value);
}

/**
 * Creates an empty value for a block editor, used when the property has no value yet.
 */
export function createEmptyBlockValue(kind: BlockEditorKind): Record<string, any> {
  const blocks = {
    layout: { [BLOCK_EDITOR_ALIASES[kind]]: [] },
    contentData: [],
    settingsData: [],
    expose: [],
  };
  return kind === "RichText" ? { markup: "", blocks } : blocks;
}

/**
 * Returns the top-level block container of a property value, normalising a missing `layout`,
 * layout array for the editor, or `expose` array in place so callers can mutate them.
 * Only the top-level container is returned, never a block structure nested inside a block.
 *
 * @returns The container, or null if the value doesn't match the editor kind's structure.
 */
export function getTopLevelBlockContainer(
  value: any,
  kind: BlockEditorKind
): (DiscoveredBlockArrays & { layout: Record<string, any[]>; expose: BlockExposeItem[]; layoutItems: BlockLayoutItem[] }) | null {
  const matches = kind === "RichText" ? isRteWithBlocks(value) : isBlockListOrGridValue(value);
  if (!matches) {
    return null;
  }

  const raw = kind === "RichText" ? value.blocks : value;
  if (!raw.layout || typeof raw.layout !== "object") {
    raw.layout = {};
  }
  const layoutAlias = BLOCK_EDITOR_ALIASES[kind];
  if (!Array.isArray(raw.layout[layoutAlias])) {
    raw.layout[layoutAlias] = [];
  }
  if (!Array.isArray(raw.expose)) {
    raw.expose = [];
  }

  // The first discovered entry is always the top-level container (discovery pushes it before recursing).
  const [topLevel] = discoverAllBlockArrays(value, "root");
  return {
    ...topLevel,
    layout: raw.layout,
    expose: raw.expose,
    layoutItems: raw.layout[layoutAlias],
  };
}

/**
 * Builds a contentData/settingsData entry.
 */
export function buildBlockEntry(
  key: string,
  contentTypeKey: string,
  properties: BlockPropertyValueInput[]
): BlockDataItem {
  return {
    key,
    contentTypeKey,
    values: properties.map(p => ({
      alias: p.alias,
      culture: p.culture ?? null,
      segment: p.segment ?? null,
      value: p.value,
    })),
  };
}

/**
 * Builds a layout entry. BlockGrid entries carry columnSpan/rowSpan/areas; BlockList and
 * RichText entries only carry contentKey (and settingsKey when present).
 */
export function buildLayoutEntry(
  kind: BlockEditorKind,
  options: {
    contentKey: string;
    settingsKey?: string | null;
    columnSpan?: number;
    rowSpan?: number;
    areaKeys?: string[];
  }
): BlockLayoutItem {
  const entry: BlockLayoutItem = { contentKey: options.contentKey };
  if (options.settingsKey) {
    entry.settingsKey = options.settingsKey;
  }
  if (kind === "BlockGrid") {
    entry.columnSpan = options.columnSpan ?? DEFAULT_GRID_COLUMN_SPAN;
    entry.rowSpan = options.rowSpan ?? DEFAULT_GRID_ROW_SPAN;
    entry.areas = (options.areaKeys ?? []).map(key => ({ key, items: [] }));
  }
  return entry;
}

/**
 * Builds expose entries for a new block: one per culture (null for invariant).
 */
export function buildExposeEntries(
  contentKey: string,
  cultures: Array<string | null>,
  segment: string | null = null
): BlockExposeItem[] {
  const unique = Array.from(new Set(cultures.length > 0 ? cultures : [null]));
  return unique.map(culture => ({ contentKey, culture, segment }));
}

/**
 * Inserts an item into an array relative to a sibling identified by key.
 * Mutates the array in place.
 *
 * @returns true if inserted; false when a before/after sibling key isn't present in the array.
 */
export function insertAtPosition<T>(
  items: T[],
  item: T,
  placement: BlockPlacement,
  keyOf: (item: T) => string
): boolean {
  switch (placement.position) {
    case "prepend":
      items.unshift(item);
      return true;
    case "append":
      items.push(item);
      return true;
    case "before":
    case "after": {
      const index = items.findIndex(i => keyOf(i) === placement.contentKey);
      if (index === -1) {
        return false;
      }
      items.splice(placement.position === "before" ? index : index + 1, 0, item);
      return true;
    }
  }
}

/**
 * Finds a layout item by contentKey, searching BlockGrid areas recursively.
 */
export function findLayoutLocation(
  items: BlockLayoutItem[],
  contentKey: string,
  parent?: BlockLayoutItem,
  areaKey?: string
): LayoutLocation | null {
  for (let index = 0; index < items.length; index++) {
    const entry = items[index];
    if (entry.contentKey === contentKey) {
      return { items, index, entry, parent, areaKey };
    }
    for (const area of entry.areas ?? []) {
      const found = findLayoutLocation(area.items ?? [], contentKey, entry, area.key);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * Collects the contentKeys of every block nested inside a BlockGrid layout item's areas.
 */
export function collectNestedAreaContentKeys(entry: BlockLayoutItem): string[] {
  const keys: string[] = [];
  for (const area of entry.areas ?? []) {
    for (const child of area.items ?? []) {
      keys.push(child.contentKey, ...collectNestedAreaContentKeys(child));
    }
  }
  return keys;
}

/**
 * Removes a block from a top-level container: its layout entry, contentData entry, settingsData
 * entry (resolved via the layout entry's settingsKey) and every expose entry. Mutates in place.
 * Callers must check for nested area children first; this does not cascade.
 *
 * @returns The removed layout entry, or null if the block isn't in the layout or contentData.
 */
export function removeBlockFromContainer(
  container: DiscoveredBlockArrays & { expose: BlockExposeItem[] },
  location: LayoutLocation
): { layoutEntry: BlockLayoutItem; settingsKey: string | null } | null {
  const contentKey = location.entry.contentKey;
  const contentIndex = container.contentData.findIndex(b => b.key === contentKey);
  if (contentIndex === -1) {
    return null;
  }

  const settingsKey = location.entry.settingsKey ?? null;
  location.items.splice(location.index, 1);
  container.contentData.splice(contentIndex, 1);

  if (settingsKey) {
    const settingsIndex = container.settingsData.findIndex(b => b.key === settingsKey);
    if (settingsIndex !== -1) {
      container.settingsData.splice(settingsIndex, 1);
    }
  }

  for (let i = container.expose.length - 1; i >= 0; i--) {
    if (container.expose[i].contentKey === contentKey) {
      container.expose.splice(i, 1);
    }
  }

  return { layoutEntry: location.entry, settingsKey };
}

// ---------------------------------------------------------------------------------------------
// RichText markup
// ---------------------------------------------------------------------------------------------

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function rteBlockElementPattern(contentKey: string): RegExp {
  const key = escapeRegExp(contentKey);
  return new RegExp(
    `<(umb-rte-block(?:-inline)?)\\b[^>]*\\bdata-content-key=["']${key}["'][^>]*?(?:/>|>[\\s\\S]*?</\\1>)`,
    "i"
  );
}

/**
 * Builds the markup element the RichText editor stores for a block.
 */
export function buildRteBlockElement(contentKey: string, inline: boolean = false): string {
  const tag = inline ? "umb-rte-block-inline" : "umb-rte-block";
  return `<${tag} data-content-key="${contentKey}"><!--Umbraco-Block--></${tag}>`;
}

/**
 * Finds a block's element in RichText markup.
 */
export function findRteBlockElement(markup: string, contentKey: string): { start: number; end: number } | null {
  const match = rteBlockElementPattern(contentKey).exec(markup ?? "");
  if (!match) {
    return null;
  }
  return { start: match.index, end: match.index + match[0].length };
}

/**
 * Inserts a block element into RichText markup relative to a sibling block's element.
 * Inline blocks appended/prepended are wrapped in a paragraph so they stay valid markup.
 *
 * @returns The new markup, or null if a before/after sibling isn't present in the markup.
 */
export function insertRteBlockElement(
  markup: string,
  element: string,
  placement: BlockPlacement,
  inline: boolean = false
): string | null {
  const current = markup ?? "";
  const standalone = inline ? `<p>${element}</p>` : element;
  switch (placement.position) {
    case "prepend":
      return standalone + current;
    case "append":
      return current + standalone;
    case "before":
    case "after": {
      const sibling = findRteBlockElement(current, placement.contentKey);
      if (!sibling) {
        return null;
      }
      const at = placement.position === "before" ? sibling.start : sibling.end;
      return current.slice(0, at) + element + current.slice(at);
    }
  }
}

/**
 * Removes a block's element from RichText markup. A paragraph left empty by removing an inline
 * block is removed too.
 *
 * @returns The new markup, or null if the element isn't present.
 */
export function removeRteBlockElement(markup: string, contentKey: string): string | null {
  const found = findRteBlockElement(markup, contentKey);
  if (!found) {
    return null;
  }
  const result = markup.slice(0, found.start) + markup.slice(found.end);
  return result.replace(/<p>\s*<\/p>/g, "");
}

// ---------------------------------------------------------------------------------------------
// Data type block configuration
// ---------------------------------------------------------------------------------------------

/**
 * Reads the `blocks` configuration from a data type's configuration values.
 */
export function getBlockTypeConfigurations(
  dataTypeValues: Array<{ alias: string; value?: unknown }> | null | undefined
): BlockTypeConfiguration[] {
  const blocks = dataTypeValues?.find(v => v.alias === "blocks")?.value;
  return Array.isArray(blocks) ? (blocks as BlockTypeConfiguration[]) : [];
}

/**
 * Finds the block type configuration for an element type.
 */
export function findBlockTypeConfiguration(
  configs: BlockTypeConfiguration[],
  contentElementTypeKey: string
): BlockTypeConfiguration | undefined {
  return configs.find(c => c.contentElementTypeKey === contentElementTypeKey);
}

/**
 * Finds a named area on a parent block type's configuration.
 */
export function findAreaConfiguration(
  configs: BlockTypeConfiguration[],
  parentContentTypeKey: string,
  areaKey: string
): BlockGridAreaConfiguration | undefined {
  return findBlockTypeConfiguration(configs, parentContentTypeKey)?.areas?.find(a => a.key === areaKey);
}

/**
 * Checks whether a block type may be placed in a BlockGrid area.
 * Unset flags are treated as allowed; a non-empty specifiedAllowance restricts the area to the
 * listed element types and block groups.
 *
 * @returns null if allowed, otherwise the reason it isn't.
 */
export function checkAllowedInArea(
  blockConfig: BlockTypeConfiguration,
  area: BlockGridAreaConfiguration
): string | null {
  if (blockConfig.allowInAreas === false) {
    return `Element type '${blockConfig.contentElementTypeKey}' is not allowed in areas`;
  }
  const allowance = area.specifiedAllowance ?? [];
  if (allowance.length === 0) {
    return null;
  }
  const allowed = allowance.some(a =>
    (a.elementTypeKey && a.elementTypeKey === blockConfig.contentElementTypeKey) ||
    (a.groupKey && blockConfig.groupKey && a.groupKey === blockConfig.groupKey)
  );
  return allowed
    ? null
    : `Element type '${blockConfig.contentElementTypeKey}' is not allowed in area '${area.alias ?? area.key}'`;
}
