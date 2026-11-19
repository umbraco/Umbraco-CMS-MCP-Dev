/**
 * Helpers for reporting fatal start-up errors from src/index.ts. Kept in
 * their own module (index.ts runs main() on import) so they can be unit
 * tested.
 */

/** Set to "true" or "1" to print the full stack trace and cause chain. */
export const DEBUG_ENV_VAR = "UMBRACO_MCP_DEBUG";

const describeFetchFailureCause = (cause: unknown): string => {
  // Node's fetch retries dual-stack `localhost` lookups (IPv6 then IPv4); if
  // both fail, the cause is an AggregateError whose own .message is empty —
  // the useful detail (e.g. ECONNREFUSED) is one level deeper, in .errors.
  if (cause instanceof AggregateError) {
    const details = cause.errors
      .map((inner) => (inner instanceof Error ? inner.message : String(inner)))
      .filter(Boolean)
      .join("; ");
    return details ? `: ${details}` : "";
  }
  return cause instanceof Error && cause.message ? `: ${cause.message}` : "";
};

/**
 * Wraps a bare connection failure (Node's fetch throws `TypeError: fetch
 * failed` with no indication of *where* it tried to connect) with the
 * configured base URL. Anything else — wrong credentials, a non-2xx
 * response, etc — already carries its own clear message (e.g. "Token request
 * failed: 401 Unauthorized") and is returned unchanged. Never includes
 * clientId/clientSecret: only the base URL, which isn't a secret.
 */
export const describeUnreachableServer = (error: unknown, baseUrl: string): unknown => {
  if (error instanceof TypeError && error.message === "fetch failed") {
    const causeMessage = describeFetchFailureCause((error as { cause?: unknown }).cause);
    return new Error(`Could not reach Umbraco at ${baseUrl} (fetch failed${causeMessage})`, { cause: error });
  }
  return error;
};

export const isDebugEnabled = (env: Record<string, string | undefined> = process.env): boolean => {
  const value = env[DEBUG_ENV_VAR]?.trim().toLowerCase();
  return value === "true" || value === "1";
};

/**
 * Builds the console.error arguments for a fatal start-up error: a single
 * `<name>: <message>` line by default, or the Error itself (stack trace and
 * cause chain, as rendered by util.inspect) when debug is enabled. A
 * non-Error throw has no name of its own, so it gets an explicit prefix.
 */
export const formatFatalError = (error: unknown, debug: boolean): unknown[] => {
  if (!(error instanceof Error)) {
    return ["Error:", error];
  }
  if (debug) {
    return [error];
  }
  return [`${error.name}: ${error.message}`, `(set ${DEBUG_ENV_VAR}=true for the full stack trace)`];
};
