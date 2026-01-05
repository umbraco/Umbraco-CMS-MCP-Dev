import { BLANK_UUID } from "@/constants/constants.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

// ============================================================================
// Normalization Rules - Data-Driven Approach
// ============================================================================

/** Fields that should be normalized to "NORMALIZED_DATE" */
const DATE_FIELDS = [
  "created",
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
    normalized.variants = normalizeVariants(normalized.variants, idToReplace);
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

  // Normalize media src paths (e.g., /media/ykvl3nua/example.jpg -> /media/NORMALIZED_PATH/example.jpg)
  if (normalized.src && typeof normalized.src === "string") {
    normalized.src = normalized.src.replace(/\/media\/[a-z0-9]+\//i, "/media/NORMALIZED_PATH/");
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

  // Recursively normalize values array (used in media/document responses)
  if (normalized.values && Array.isArray(normalized.values)) {
    normalized.values = normalized.values.map((item: any) => normalizeObject(item, idToReplace, normalizeIdRefs));
  }

  // Recursively normalize nested 'value' field (used in property values)
  if (normalized.value && typeof normalized.value === "object") {
    normalized.value = normalizeObject(normalized.value, idToReplace, normalizeIdRefs);
  }

  // Recursively normalize structuredContent (for MCP tool responses)
  if (normalized.structuredContent && typeof normalized.structuredContent === "object") {
    normalized.structuredContent = normalizeObject(normalized.structuredContent, idToReplace, normalizeIdRefs);
  }

  // Recursively normalize nested 'document' field (common in response wrappers)
  if (normalized.document && typeof normalized.document === "object") {
    normalized.document = normalizeObject(normalized.document, idToReplace, normalizeIdRefs);
  }

  return normalized;
}

/**
 * Normalizes variant arrays (used in documents)
 * Uses normalizeObject for full recursive normalization of each variant
 */
function normalizeVariants(variants: any[], idToReplace?: string): any[] {
  return variants.map((variant: any) => normalizeObject(variant, idToReplace, true));
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Creates a normalized result suitable for snapshot testing.
 * Normalizes structuredContent responses from MCP tools.
 *
 * @param result - The tool result to normalize
 * @param idToReplace - Optional specific ID to replace (for single item responses)
 */
export function createSnapshotResult(result: any, idToReplace?: string) {
  if (result?.structuredContent !== undefined) {
    return {
      ...result,
      structuredContent: normalizeObject(result.structuredContent, idToReplace, true),
    };
  }

  // Pass through non-structuredContent results unchanged
  return result;
}

/**
 * Normalizes error responses for snapshot testing.
 * Handles traceId normalization in structuredContent.
 */
export function normalizeErrorResponse(result: CallToolResult): CallToolResult {
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

  return result;
}
