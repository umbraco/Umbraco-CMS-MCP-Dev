import GetStaticFilesTool from "../items/get/get-static-files.js";
import { StaticFileHelper } from "./helpers/static-file-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_PATH_ARRAY = ["css", "bootstrap"];
const INVALID_PATH_ARRAY = ["nonexistent", "invalid"];

describe("get-static-files", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    // StaticFile is read-only, no cleanup needed
  });

  it("should get all static files when no path is specified", async () => {
    // Arrange - no path filtering
    const params = {};

    // Act
    const result = await GetStaticFilesTool.handler(
      params,
      { signal: new AbortController().signal }
    );

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify response structure
    const items = JSON.parse(result.content[0].text?.toString() ?? "[]");
    expect(Array.isArray(items)).toBe(true);

    // Verify file system structure if items exist
    if (items.length > 0) {
      const isValidStructure = StaticFileHelper.verifyFileSystemStructure(items);
      expect(isValidStructure).toBe(true);
    }
  });

  it("should get static files filtered by path", async () => {
    // Arrange - first find a valid path to test with
    const rootItems = await StaticFileHelper.getRootItems();

    // Use a common folder that might exist, or skip if no folders
    const testFolder = rootItems.find(item => item.isFolder && (
      item.name === "css" ||
      item.name === "js" ||
      item.name === "scripts" ||
      item.name === "styles"
    ));

    if (!testFolder) {
      console.log("No common folders found in root, testing with empty path array");
      // Test with empty path array instead
      const params = { path: [] };

      // Act
      const result = await GetStaticFilesTool.handler(
        params,
        { signal: new AbortController().signal }
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();
      return;
    }

    // Test with found folder path
    const pathArray = [testFolder.name];
    const params = { path: pathArray };

    // Act
    const result = await GetStaticFilesTool.handler(
      params,
      { signal: new AbortController().signal }
    );

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify response structure
    const items = JSON.parse(result.content[0].text?.toString() ?? "[]");
    expect(Array.isArray(items)).toBe(true);

    // Verify file system structure if items exist
    if (items.length > 0) {
      const isValidStructure = StaticFileHelper.verifyFileSystemStructure(items);
      expect(isValidStructure).toBe(true);
    }
  });

  it("should handle invalid path gracefully", async () => {
    // Arrange - use clearly invalid path
    const params = { path: INVALID_PATH_ARRAY };

    // Act
    const result = await GetStaticFilesTool.handler(
      params,
      { signal: new AbortController().signal }
    );

    // Assert - should not fail, just return empty array or handle gracefully
    expect(result).toMatchSnapshot();

    // Verify response is still valid even if empty
    const items = JSON.parse(result.content[0].text?.toString() ?? "[]");
    expect(Array.isArray(items)).toBe(true);
  });

  it("should handle empty path array", async () => {
    // Arrange
    const params = { path: [] };

    // Act
    const result = await GetStaticFilesTool.handler(
      params,
      { signal: new AbortController().signal }
    );

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify response structure
    const items = JSON.parse(result.content[0].text?.toString() ?? "[]");
    expect(Array.isArray(items)).toBe(true);

    // Verify file system structure if items exist
    if (items.length > 0) {
      const isValidStructure = StaticFileHelper.verifyFileSystemStructure(items);
      expect(isValidStructure).toBe(true);
    }
  });

  it("should return items with proper file system properties", async () => {
    // Arrange
    const params = {};

    // Act
    const result = await GetStaticFilesTool.handler(
      params,
      { signal: new AbortController().signal }
    );

    // Assert
    const items = JSON.parse(result.content[0].text?.toString() ?? "[]");

    if (items.length > 0) {
      // Check first item has expected structure
      const firstItem = items[0];
      expect(firstItem).toHaveProperty('path');
      expect(firstItem).toHaveProperty('name');
      expect(firstItem).toHaveProperty('isFolder');
      expect(typeof firstItem.path).toBe('string');
      expect(typeof firstItem.name).toBe('string');
      expect(typeof firstItem.isFolder).toBe('boolean');

      // Parent property is optional but if present should be an object
      if (firstItem.parent) {
        expect(firstItem.parent).toHaveProperty('path');
        expect(typeof firstItem.parent.path).toBe('string');
      }
    }
  });
});