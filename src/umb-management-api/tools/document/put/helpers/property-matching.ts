/**
 * Pure helper functions for property matching and key generation.
 * These are used by update-document-properties and update-block-property tools.
 */

/**
 * Matches a property by alias, culture, and segment.
 * Handles null/undefined normalization for comparison.
 *
 * @param value - The value object to check (from document values array)
 * @param alias - The property alias to match
 * @param culture - Optional culture code to match
 * @param segment - Optional segment identifier to match
 * @returns true if the value matches all criteria
 */
export function matchesProperty(
  value: { alias: string; culture?: string | null; segment?: string | null },
  alias: string,
  culture?: string | null,
  segment?: string | null
): boolean {
  return value.alias === alias &&
    (value.culture ?? null) === (culture ?? null) &&
    (value.segment ?? null) === (segment ?? null);
}

/**
 * Creates a human-readable property key for error reporting and success messages.
 * Format: "alias" or "alias[culture]" or "alias[culture][segment]"
 *
 * @param alias - The property alias
 * @param culture - Optional culture code
 * @param segment - Optional segment identifier
 * @returns Formatted property key string
 */
export function getPropertyKey(alias: string, culture?: string | null, segment?: string | null): string {
  let key = alias;
  if (culture) key += `[${culture}]`;
  if (segment) key += `[${segment}]`;
  return key;
}
