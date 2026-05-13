/**
 * Holds the connected Umbraco server version, populated once at startup.
 *
 * Used by collection registrations to decide whether to expose tools that
 * depend on endpoints introduced in newer Umbraco versions (e.g. the Schema
 * API endpoints added in 17.4). When Umbraco 18 is the floor, the legacy
 * tool branches that read this value can be deleted.
 */

let umbracoVersion: string | null = null;

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
export function isUmbracoAtLeast(major: number, minor: number): boolean {
  if (!umbracoVersion) return false;
  const [maj, min] = umbracoVersion.split(".").map((n) => parseInt(n, 10));
  if (Number.isNaN(maj) || Number.isNaN(min)) return false;
  if (maj > major) return true;
  if (maj < major) return false;
  return min >= minor;
}
