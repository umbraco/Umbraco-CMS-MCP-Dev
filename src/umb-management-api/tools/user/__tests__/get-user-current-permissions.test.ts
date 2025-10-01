import GetUserCurrentPermissionsTool from "../get/get-user-current-permissions.js";
import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { jest } from "@jest/globals";

describe("get-user-current-permissions", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
  });

  it("should get current user permissions", async () => {
    // Act
    const result = await GetUserCurrentPermissionsTool().handler({}, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should return consistent permissions on multiple calls", async () => {
    // Act
    const result1 = await GetUserCurrentPermissionsTool().handler({}, { signal: new AbortController().signal });
    const result2 = await GetUserCurrentPermissionsTool().handler({}, { signal: new AbortController().signal });

    // Assert
    const normalizedResult1 = createSnapshotResult(result1);
    const normalizedResult2 = createSnapshotResult(result2);

    expect(normalizedResult1).toEqual(normalizedResult2);
  });

  it("should handle non-existent ID", async () => {
    // Act
    const result = await GetUserCurrentPermissionsTool().handler({
      id: [BLANK_UUID]
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = normalizeErrorResponse(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});