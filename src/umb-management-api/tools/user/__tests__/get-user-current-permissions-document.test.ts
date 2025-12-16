import GetUserCurrentPermissionsDocumentTool from "../get/get-user-current-permissions-document.js";
import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { jest } from "@jest/globals";

describe("get-user-current-permissions-document", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
  });

  it("should get current user document permissions", async () => {
    // Act
    const result = await GetUserCurrentPermissionsDocumentTool.handler({}, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle non-existent document ID", async () => {
    // Act
    const result = await GetUserCurrentPermissionsDocumentTool.handler({
      id: [BLANK_UUID]
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = normalizeErrorResponse(result);
    expect(normalizedResult).toMatchSnapshot();
  });

});