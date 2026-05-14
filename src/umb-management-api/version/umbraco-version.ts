/**
 * Project-local store for the Umbraco server version. Populated once at boot
 * from the existing getServerInformation() call. Read by withVersionDispatch
 * to choose pre/post-17.4 handlers without an SDK round-trip.
 */

let umbracoVersion: string | null = null;

export const setUmbracoVersion = (version: string): void => {
  umbracoVersion = version;
};

export const resetUmbracoVersion = (): void => {
  umbracoVersion = null;
};

export const getUmbracoVersion = (): string | null => umbracoVersion;

interface ParsedVersion {
  major: number;
  minor: number;
}

const parse = (raw: string): ParsedVersion | null => {
  const match = /^(\d+)\.(\d+)/.exec(raw);
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]) };
};

/**
 * Returns true if the stored Umbraco version is at least `target`.
 * `target` accepts "MAJOR.MINOR" (e.g. "17.4") — patch is ignored.
 * Returns false if the stored version is null or unparseable: callers
 * treat "unknown" as "older" so we fall back to fixtures, not API calls.
 */
export const isAtLeast = (target: string): boolean => {
  if (umbracoVersion === null) return false;
  const current = parse(umbracoVersion);
  const wanted = parse(target);
  if (current === null || wanted === null) return false;
  if (current.major !== wanted.major) return current.major > wanted.major;
  return current.minor >= wanted.minor;
};
