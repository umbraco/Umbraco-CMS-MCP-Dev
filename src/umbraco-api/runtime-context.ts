import { getActiveRequestContext, UMBRACO_VERSION_CONTEXT_KEY } from "@umbraco-cms/mcp-server-sdk";

/**
 * Holds the connected Umbraco server version, populated once at startup.
 *
 * Used by collection registrations to decide whether to expose tools that
 * depend on endpoints introduced in newer Umbraco releases (e.g. the Schema
 * API endpoints added in 17.4). When Umbraco 18 is the floor, the legacy
 * tool branches that read this value can be deleted.
 */

let umbracoVersion: string | null = null;

/**
 * Controls whether the filePath upload source is exposed in media upload tools.
 * Defaults to false (safe for Cloudflare Workers / hosted environments where
 * the local filesystem is unavailable). Set to true in the Node/stdio entry
 * point where filesystem access is available.
 */
let allowFilePathUploads = false;

export function setAllowFilePathUploads(allow: boolean): void {
  allowFilePathUploads = allow;
}

export function isFilePathUploadAllowed(): boolean {
  return allowFilePathUploads;
}

export function setUmbracoVersion(version: string | null | undefined): void {
  umbracoVersion = version ?? null;
}

export function getUmbracoVersion(): string | null {
  return umbracoVersion;
}

/**
 * Returns true if the connected Umbraco is at least the requested major.minor.
 * Conservative: returns false when the version is unknown so legacy tools win
 * for any environment where the version probe failed.
 */
export function isUmbracoAtLeast(major: number, minor: number, requestVersion?: string): boolean {
  // Version precedence:
  //   1. the version passed in (registration time: `tools(user, { umbracoVersion })`),
  //   2. the version on the active request context (handler time, hosted),
  //   3. the start-up version set by the stdio entry point.
  // Hosted never sets (3) — one isolate serves many sites — so only the
  // per-request value counts there. Unknown version: legacy branch.
  const version = requestVersion ?? getActiveRequestContext()?.[UMBRACO_VERSION_CONTEXT_KEY] ?? umbracoVersion;
  if (!version) return false;
  const [maj, min] = version.split(".").map((n) => parseInt(n, 10));
  if (Number.isNaN(maj) || Number.isNaN(min)) return false;
  if (maj > major) return true;
  if (maj < major) return false;
  return min >= minor;
}
