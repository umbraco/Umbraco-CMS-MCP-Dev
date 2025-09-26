import GetUserCurrentTool from "../get/get-user-current.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

describe("get-user-current", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
  });

  it("should get current authenticated user information", async () => {
    // Act
    const result = await GetUserCurrentTool().handler({}, { signal: new AbortController().signal });

    // Extract user ID for proper normalization
    const parsed = JSON.parse(result.content[0].text as string);
    const userId = parsed.id;

    // Assert
    const normalizedResult = createSnapshotResult(result, userId);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return consistent user information on multiple calls", async () => {
    // Act
    const result1 = await GetUserCurrentTool().handler({}, { signal: new AbortController().signal });
    const result2 = await GetUserCurrentTool().handler({}, { signal: new AbortController().signal });

    // Extract user ID for proper normalization
    const parsed1 = JSON.parse(result1.content[0].text as string);
    const userId = parsed1.id;

    // Assert
    const normalizedResult1 = createSnapshotResult(result1, userId);
    const normalizedResult2 = createSnapshotResult(result2, userId);

    expect(normalizedResult1).toEqual(normalizedResult2);
  });
});