import GetPartialViewSnippetTool from "../get/get-partial-view-snippet.js";
import GetPartialViewSnippetByIdTool from "../get/get-partial-view-snippet-by-id.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const NON_EXISTENT_SNIPPET_ID = "non-existent-snippet-id";

describe("get-snippets", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe("GetPartialViewSnippetTool", () => {
    it("should get partial view snippets with default parameters", async () => {
      // Arrange
      const params = { take: 10 };

      // Act
      const result = await GetPartialViewSnippetTool.handler(params, { signal: new AbortController().signal });

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response structure
      const responseData = JSON.parse(String(result.content[0].text));
      expect(responseData).toHaveProperty('items');
      expect(Array.isArray(responseData.items)).toBe(true);
      expect(responseData).toHaveProperty('total');
      expect(typeof responseData.total).toBe('number');
    });

    it("should get partial view snippets with custom pagination", async () => {
      // Arrange
      const params = {
        skip: 0,
        take: 5
      };

      // Act
      const result = await GetPartialViewSnippetTool.handler(params, { signal: new AbortController().signal });

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response structure with pagination
      const responseData = JSON.parse(String(result.content[0].text));
      expect(responseData).toHaveProperty('items');
      expect(Array.isArray(responseData.items)).toBe(true);
      expect(responseData.items.length).toBeLessThanOrEqual(5);
    });

    it("should get partial view snippets with skip parameter", async () => {
      // Arrange
      const params = {
        skip: 5,
        take: 10
      };

      // Act
      const result = await GetPartialViewSnippetTool.handler(params, { signal: new AbortController().signal });

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response structure
      const responseData = JSON.parse(String(result.content[0].text));
      expect(responseData).toHaveProperty('items');
      expect(Array.isArray(responseData.items)).toBe(true);
    });

    it("should handle edge case with very high skip value", async () => {
      // Arrange
      const params = {
        skip: 1000,
        take: 10
      };

      // Act
      const result = await GetPartialViewSnippetTool.handler(params, { signal: new AbortController().signal });

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response structure (should return empty items array)
      const responseData = JSON.parse(String(result.content[0].text));
      expect(responseData).toHaveProperty('items');
      expect(Array.isArray(responseData.items)).toBe(true);
      expect(responseData.items.length).toBe(0);
    });
  });

  describe("GetPartialViewSnippetByIdTool", () => {
    it("should get a specific partial view snippet by ID", async () => {
      // Arrange - First get available snippets to find a valid ID
      const listResult = await GetPartialViewSnippetTool.handler({ take: 10 }, { signal: new AbortController().signal });
      const listResponseData = JSON.parse(String(listResult.content[0].text));
      
      // Skip this test if no snippets are available
      if (!listResponseData.items || listResponseData.items.length === 0) {
        console.log('No partial view snippets available for testing');
        return;
      }

      // Use the first available snippet name/identifier as ID 
      const firstSnippetId = String(listResponseData.items[0].name || listResponseData.items[0].fileName || "layout");
      expect(firstSnippetId).toBeDefined();

      const params = {
        id: firstSnippetId
      };

      // Act
      const result = await GetPartialViewSnippetByIdTool.handler(params, { signal: new AbortController().signal });

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response contains expected snippet data
      const responseData = JSON.parse(String(result.content[0].text));
      expect(responseData).toHaveProperty('name');
      expect(responseData).toHaveProperty('content');
    });

    it("should handle non-existent snippet ID", async () => {
      // Arrange
      const params = {
        id: NON_EXISTENT_SNIPPET_ID
      };

      // Act
      const result = await GetPartialViewSnippetByIdTool.handler(params, { signal: new AbortController().signal });

      // Assert - Error responses don't use createSnapshotResult
      expect(result).toMatchSnapshot();
    });

    it("should handle empty snippet ID", async () => {
      // Arrange
      const params = {
        id: ""
      };

      // Act
      const result = await GetPartialViewSnippetByIdTool.handler(params, { signal: new AbortController().signal });

      // Assert - Error responses don't use createSnapshotResult
      expect(result).toMatchSnapshot();
    });

    it("should handle invalid snippet ID format", async () => {
      // Arrange
      const params = {
        id: "invalid/id/with/slashes"
      };

      // Act
      const result = await GetPartialViewSnippetByIdTool.handler(params, { signal: new AbortController().signal });

      // Assert - Error responses don't use createSnapshotResult
      expect(result).toMatchSnapshot();
    });
  });
});