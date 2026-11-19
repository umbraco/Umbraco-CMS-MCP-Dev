import { describeUnreachableServer, formatFatalError, isDebugEnabled, DEBUG_ENV_VAR } from "../startup-errors.js";

// Covers #549: fatal start-up errors print once, and an unreachable site
// names the base URL (never the credentials).
describe("startup-errors", () => {
  const baseUrl = "https://localhost:44391";

  const fetchFailed = (cause?: unknown) => new TypeError("fetch failed", cause === undefined ? undefined : { cause });

  describe("describeUnreachableServer", () => {
    it("adds the base URL and the cause message to a fetch failure", () => {
      const original = fetchFailed(new Error("self-signed certificate"));
      const result = describeUnreachableServer(original, baseUrl) as Error;

      expect(result.message).toBe(`Could not reach Umbraco at ${baseUrl} (fetch failed: self-signed certificate)`);
      expect(result.cause).toBe(original);
    });

    it("reads the inner errors of an AggregateError cause", () => {
      const cause = new AggregateError([new Error("connect ECONNREFUSED ::1:44391"), new Error("connect ECONNREFUSED 127.0.0.1:44391")]);
      const result = describeUnreachableServer(fetchFailed(cause), baseUrl) as Error;

      expect(result.message).toBe(
        `Could not reach Umbraco at ${baseUrl} (fetch failed: connect ECONNREFUSED ::1:44391; connect ECONNREFUSED 127.0.0.1:44391)`,
      );
    });

    it("omits the detail when the fetch failure has no usable cause", () => {
      const result = describeUnreachableServer(fetchFailed(), baseUrl) as Error;

      expect(result.message).toBe(`Could not reach Umbraco at ${baseUrl} (fetch failed)`);
    });

    it("returns any other error unchanged", () => {
      const unauthorized = new Error("Token request failed: 401 Unauthorized");
      const otherTypeError = new TypeError("something else");

      expect(describeUnreachableServer(unauthorized, baseUrl)).toBe(unauthorized);
      expect(describeUnreachableServer(otherTypeError, baseUrl)).toBe(otherTypeError);
      expect(describeUnreachableServer("a string", baseUrl)).toBe("a string");
    });
  });

  describe("formatFatalError", () => {
    it("prints a single name-and-message line by default, without a doubled prefix", () => {
      const [line, hint, ...rest] = formatFatalError(new Error("Token request failed: 401 Unauthorized"), false);

      expect(line).toBe("Error: Token request failed: 401 Unauthorized");
      expect(hint).toContain(DEBUG_ENV_VAR);
      expect(rest).toHaveLength(0);
    });

    it("keeps the error's own name", () => {
      expect(formatFatalError(new TypeError("boom"), false)[0]).toBe("TypeError: boom");
    });

    it("passes the Error itself through in debug mode so the stack is printed", () => {
      const error = new Error("boom");

      expect(formatFatalError(error, true)).toEqual([error]);
    });

    it("prefixes a non-Error throw", () => {
      expect(formatFatalError("boom", false)).toEqual(["Error:", "boom"]);
      expect(formatFatalError("boom", true)).toEqual(["Error:", "boom"]);
    });
  });

  describe("isDebugEnabled", () => {
    it.each([
      ["true", true],
      ["TRUE", true],
      ["1", true],
      [" true ", true],
      ["false", false],
      ["0", false],
      ["", false],
      [undefined, false],
    ])("%p -> %p", (value, expected) => {
      expect(isDebugEnabled({ [DEBUG_ENV_VAR]: value })).toBe(expected);
    });
  });
});
