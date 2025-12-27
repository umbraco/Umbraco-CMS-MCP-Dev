import { BLANK_UUID } from "@/constants/constants.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

// ============================================================================
// Normalization Rules - Data-Driven Approach
// ============================================================================

/** Fields that should be normalized to "NORMALIZED_DATE" */
const DATE_FIELDS = [
  "createDate",
  "publishDate",
  "updateDate",
  "versionDate",
  "lastLoginDate",
  "lastPasswordChangeDate",
  "lastLockoutDate",
  "availableUntil",
] as const;

/** Fields that are object references with an id property to normalize */
const ID_REFERENCE_FIELDS = [
  "parent",
  "document",
  "documentType",
  "mediaType",
  "user",
] as const;

/** Regex-based normalizations for string fields */
const REGEX_NORMALIZATIONS: Array<{
  field: string;
  pattern: RegExp;
  replacement: string;
}> = [
  { field: "name", pattern: /_\d{13}(?=_|\.js$|$)/, replacement: "_NORMALIZED_TIMESTAMP" },
  { field: "path", pattern: /_\d{13}(?=_|\.js$|\/|$)/g, replacement: "_NORMALIZED_TIMESTAMP" },
  { field: "email", pattern: /-\d+@/, replacement: "-NORMALIZED@" },
  { field: "userName", pattern: /-\d+@/, replacement: "-NORMALIZED@" },
];

// ============================================================================
// Core Normalization Function
// ============================================================================

/**
 * Recursively normalizes an object for snapshot testing.
 * Handles IDs, dates, timestamps, and other dynamic values.
 *
 * Use this function directly when normalizing raw API response objects
 * (like items from findDocument, findDataType, etc.) for snapshot testing.
 *
 * @param obj - The object to normalize
 * @param idToReplace - Optional specific ID to replace
 * @param normalizeIdRefs - Whether to normalize ID reference fields (parent, document, etc.)
 */
export function normalizeObject(obj: any, idToReplace?: string, normalizeIdRefs: boolean = true): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => normalizeObject(item, idToReplace, normalizeIdRefs));
  }

  if (typeof obj !== "object") {
    return obj;
  }

  const normalized: any = { ...obj };

  // Normalize the main ID field
  if (idToReplace && normalized.id === idToReplace) {
    normalized.id = BLANK_UUID;
  } else if (normalized.id && !idToReplace) {
    normalized.id = BLANK_UUID;
  }

  // Normalize ID reference fields (objects with id property) - only when normalizeIdRefs is true
  if (normalizeIdRefs) {
    for (const field of ID_REFERENCE_FIELDS) {
      if (normalized[field]) {
        normalized[field] = { ...normalized[field], id: BLANK_UUID };
        // Special case: parent.path may contain timestamps
        if (field === "parent" && normalized[field].path && typeof normalized[field].path === "string") {
          normalized[field].path = normalized[field].path.replace(/_\d{13}(?=_|\.js$|\/|$)/g, "_NORMALIZED_TIMESTAMP");
        }
      }
    }
  }

  // Normalize date fields
  for (const field of DATE_FIELDS) {
    if (normalized[field]) {
      normalized[field] = "NORMALIZED_DATE";
    }
  }

  // Normalize ancestors array
  if (normalized.ancestors && Array.isArray(normalized.ancestors)) {
    normalized.ancestors = normalized.ancestors.map((ancestor: any) => ({
      ...ancestor,
      id: BLANK_UUID,
    }));
  }

  // Normalize variants array
  if (normalized.variants && Array.isArray(normalized.variants)) {
    normalized.variants = normalizeVariants(normalized.variants);
  }

  // Apply regex normalizations for string fields
  for (const { field, pattern, replacement } of REGEX_NORMALIZATIONS) {
    if (normalized[field] && typeof normalized[field] === "string") {
      normalized[field] = normalized[field].replace(pattern, replacement);
    }
  }

  // Normalize avatar URLs (array of strings with hashes)
  if (normalized.avatarUrls && Array.isArray(normalized.avatarUrls)) {
    normalized.avatarUrls = normalized.avatarUrls.map((url: string) =>
      url.replace(/\/[a-f0-9]{40}\.jpg/, "/NORMALIZED_AVATAR.jpg")
    );
  }

  // Normalize media URLs in urlInfos
  if (normalized.urlInfos && Array.isArray(normalized.urlInfos)) {
    normalized.urlInfos = normalized.urlInfos.map((urlInfo: any) => ({
      ...urlInfo,
      url: urlInfo.url ? urlInfo.url.replace(/\/media\/[a-z0-9]+\//i, "/media/NORMALIZED_PATH/") : urlInfo.url,
    }));
  }

  // Normalize block results (contentKey)
  if (normalized.results && Array.isArray(normalized.results)) {
    normalized.results = normalized.results.map((r: any) => ({
      ...r,
      contentKey: r.contentKey ? BLANK_UUID : undefined,
    }));
  }

  // Normalize availableBlocks
  if (normalized.availableBlocks && Array.isArray(normalized.availableBlocks)) {
    normalized.availableBlocks = normalized.availableBlocks.map((b: any) => ({
      ...b,
      key: BLANK_UUID,
    }));
  }

  // Recursively normalize nested items array
  if (normalized.items && Array.isArray(normalized.items)) {
    normalized.items = normalized.items.map((item: any) => normalizeObject(item, idToReplace, normalizeIdRefs));
  }

  // Recursively normalize structuredContent (for MCP tool responses)
  if (normalized.structuredContent && typeof normalized.structuredContent === "object") {
    normalized.structuredContent = normalizeObject(normalized.structuredContent, idToReplace, normalizeIdRefs);
  }

  return normalized;
}

/**
 * Normalizes variant arrays (used in documents)
 */
function normalizeVariants(variants: any[]): any[] {
  return variants.map((variant: any) => {
    const normalizedVariant = { ...variant };
    if (normalizedVariant.createDate) normalizedVariant.createDate = "NORMALIZED_DATE";
    if (normalizedVariant.publishDate) normalizedVariant.publishDate = "NORMALIZED_DATE";
    if (normalizedVariant.updateDate) normalizedVariant.updateDate = "NORMALIZED_DATE";
    if (normalizedVariant.versionDate) normalizedVariant.versionDate = "NORMALIZED_DATE";
    return normalizedVariant;
  });
}

/**
 * Normalizes a single item for legacy format.
 * This includes additional normalization for document.documentType that isn't done in structuredContent.
 */
function normalizeLegacySingleItem(parsed: any): any {
  const normalized = normalizeObject(parsed, undefined, false);

  // Legacy single-item has special handling for nested document structures
  if (normalized.document) {
    normalized.document = { ...normalized.document, id: BLANK_UUID };
    if (normalized.document.variants && Array.isArray(normalized.document.variants)) {
      normalized.document.variants = normalizeVariants(normalized.document.variants);
    }
    if (normalized.document.documentType) {
      normalized.document.documentType = { ...normalized.document.documentType, id: BLANK_UUID };
    }
  }
  if (normalized.documentType) {
    normalized.documentType = { ...normalized.documentType, id: BLANK_UUID };
  }
  if (normalized.user) {
    normalized.user = { ...normalized.user, id: BLANK_UUID };
  }

  return normalized;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Creates a normalized result suitable for snapshot testing.
 * Handles both new structuredContent format and legacy content[0].text format.
 *
 * @param result - The tool result to normalize
 * @param idToReplace - Optional specific ID to replace (for single item responses)
 */
export function createSnapshotResult(result: any, idToReplace?: string) {
  // Handle structuredContent (new format)
  if (result?.structuredContent !== undefined) {
    return {
      ...result,
      structuredContent: normalizeObject(result.structuredContent, idToReplace, true),
    };
  }

  // Legacy format: handle content[0].text with JSON strings
  if (!result?.content) {
    return result;
  }

  // Handle void operation results with empty content
  if (
    result.content.length === 1 &&
    result.content[0].type === "text" &&
    result.content[0].text === ""
  ) {
    return result;
  }

  return {
    ...result,
    content: result.content.map((item: any) => {
      if (item.type !== "text") {
        return item;
      }

      if (idToReplace) {
        // For single item responses - replace ID in text first, then parse and normalize
        // Note: Legacy single-item does NOT normalize parent.id, only the specific ID
        let text = item.text.replace(idToReplace, BLANK_UUID);
        try {
          const parsed = JSON.parse(text);
          const normalized = normalizeLegacySingleItem(parsed);
          text = JSON.stringify(normalized, null, 2);
        } catch {
          // If parsing fails, return with just the ID replacement
        }
        return { ...item, text };
      } else {
        // For list responses - normalize all IDs
        const parsed = JSON.parse(item.text);
        if (Array.isArray(parsed)) {
          // Handle array responses (like ancestors)
          const normalized = parsed.map((p: any) => normalizeObject(p, undefined, true));
          return { ...item, text: JSON.stringify(normalized) };
        }
        // Handle object responses with items
        const normalized = normalizeObject(parsed, undefined, true);
        return { ...item, text: JSON.stringify(normalized) };
      }
    }),
  };
}

/**
 * Normalizes error responses for snapshot testing.
 * Handles traceId normalization in both formats.
 */
export function normalizeErrorResponse(result: CallToolResult): CallToolResult {
  // Handle structuredContent (new format)
  if (result.structuredContent && typeof result.structuredContent === "object") {
    const normalized = { ...result };
    const content = normalized.structuredContent as any;
    if (content.traceId && typeof content.traceId === "string") {
      content.traceId = content.traceId.replace(
        /00-[0-9a-f]{32}-[0-9a-f]{16}-00/g,
        "normalized-trace-id"
      );
    }
    return normalized;
  }

  // Handle legacy content[0].text format
  if (Array.isArray(result.content) && result.content[0]) {
    const firstContent = result.content[0];
    if (firstContent.type === "text" && typeof firstContent.text === "string") {
      firstContent.text = firstContent.text.replace(
        /00-[0-9a-f]{32}-[0-9a-f]{16}-00/g,
        "normalized-trace-id"
      );
    }
  }
  return result;
}
