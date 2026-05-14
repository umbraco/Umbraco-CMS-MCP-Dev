import { isUmbracoAtLeast } from "../runtime-context.js";

/**
 * Wraps two handlers — one for pre-17.4 Umbraco, one for 17.4+ — and returns
 * a single handler that dispatches by the project-local version flag stored
 * in `runtime-context.ts`.
 *
 * Forward-default: if the version flag is unknown, calls `pre174`. Pre-17.4
 * handlers are expected to return canned fixtures (no API calls), so they're
 * safe to run before version detection has succeeded.
 */
export function withVersionDispatch<I, O>(opts: {
  pre174: (input: I) => Promise<O> | O;
  post174: (input: I) => Promise<O> | O;
}): (input: I) => Promise<O> {
  return async (input) => {
    const handler = isUmbracoAtLeast(17, 4) ? opts.post174 : opts.pre174;
    return handler(input);
  };
}
