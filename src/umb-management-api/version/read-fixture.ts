import { readFileSync } from "node:fs";

/**
 * Loads a JSON fixture from disk and parses it. Used by pre-17.4 tool handlers
 * to return canned responses shaped to the 17.4 contract.
 *
 * Accepts a path string or a URL (typically `new URL("./tool.pre174.json",
 * import.meta.url)`). Reads synchronously at module-load time; callers should
 * hold the result in a module-scoped const so we don't hit disk per call.
 */
export const readFixture = <T>(path: string | URL): T =>
  JSON.parse(readFileSync(path, "utf8")) as T;
