import GetUserCurrentPermissionsMediaTool from "../get/get-user-current-permissions-media.js";
import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { jest } from "@jest/globals";

describe("get-user-current-permissions-media", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
  });

  it("should get current user media permissions", async () => {
    // Act
    const result = await GetUserCurrentPermissionsMediaTool().handler({}, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle non-existent media ID", async () => {
    // Act
    const result = await GetUserCurrentPermissionsMediaTool().handler({
      id: [BLANK_UUID]
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = normalizeErrorResponse(result);
    expect(normalizedResult).toMatchSnapshot();
  });

});