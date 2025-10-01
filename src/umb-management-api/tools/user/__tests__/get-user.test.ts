import GetUserTool from "../get/get-user.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

describe("get-user", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("should get users list with default parameters", async () => {
    // Act
    const result = await GetUserTool().handler({ skip: 0, take: 10 }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

  });

  it("should get users with pagination", async () => {
    // Act
    const result = await GetUserTool().handler({ skip: 0, take: 5 }, { signal: new AbortController().signal });

    // Assert
    const parsed = JSON.parse(result.content[0].text as string);
    expect(parsed.items.length).toBeLessThanOrEqual(5);
  });
});