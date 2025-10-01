import GetUserCurrentLoginProvidersTool from "../get/get-user-current-login-providers.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

describe("get-user-current-login-providers", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
  });

  it("should get current user's login providers", async () => {
    // Act
    const result = await GetUserCurrentLoginProvidersTool().handler({}, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify expected structure
    const parsed = JSON.parse(result.content[0].text as string);
    expect(Array.isArray(parsed)).toBe(true);

    // Each provider should have expected properties
    if (parsed.length > 0) {
      expect(parsed[0]).toHaveProperty("name");
      expect(typeof parsed[0].name).toBe("string");
    }
  });

});