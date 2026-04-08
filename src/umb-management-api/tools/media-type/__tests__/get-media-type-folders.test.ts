import GetMediaTypeFoldersTool from "../items/get/get-media-type-folders.js";
import { withCursorPagination, encodeCursor } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
  type CursorPaginatedResult,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-media-type-folders", () => {
  setupTestEnvironment();

  const cursorTool = withCursorPagination(GetMediaTypeFoldersTool);

  describe("successful retrieval", () => {
    it("should get media type folders with default pagination", async () => {
      // Act
      const result = await cursorTool.handler(
        {},
        createMockRequestHandlerExtra()
      );

      // Assert - Validate response against tool's output schema
      const parsed = validateToolResponse(cursorTool, result);
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response structure
      expect(parsed.items).toBeDefined();
      expect(Array.isArray(parsed.items)).toBe(true);
      expect(typeof parsed.total).toBe('number');
      expect(parsed.total).toBeGreaterThanOrEqual(0);

      // Verify each item has expected properties
      parsed.items.forEach((item: any) => {
        expect(typeof item.id).toBe('string');
        expect(typeof item.name).toBe('string');
        expect(item.icon === null || typeof item.icon === 'string').toBe(true);
      });
    });

    it("should get media type folders with custom pagination parameters", async () => {
      // Act
      const smallPageTool = withCursorPagination({ ...GetMediaTypeFoldersTool, pageSize: 5 });
      const result = await smallPageTool.handler(
        {},
        createMockRequestHandlerExtra()
      );

      // Assert - Validate response against tool's output schema
      const parsed = validateToolResponse(smallPageTool, result);
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify pagination worked
      expect(parsed.items.length).toBeLessThanOrEqual(5);
      expect(typeof parsed.total).toBe('number');
    });

    it("should get media type folders with cursor for second page", async () => {
      // Act - Get first page with pageSize 1, then use cursor for next
      const smallPageTool = withCursorPagination({ ...GetMediaTypeFoldersTool, pageSize: 10 });
      const firstResult = await smallPageTool.handler(
        {},
        createMockRequestHandlerExtra()
      );

      const firstParsed = validateToolResponse(smallPageTool, firstResult) as CursorPaginatedResult;

      // If there's a next page, fetch it
      if (firstParsed.nextCursor) {
        const result = await smallPageTool.handler(
          { cursor: firstParsed.nextCursor },
          createMockRequestHandlerExtra()
        );

        // Assert - Validate response against tool's output schema
        const parsed = validateToolResponse(smallPageTool, result);
        const normalizedResult = createSnapshotResult(result);
        expect(normalizedResult).toMatchSnapshot();

        // Verify pagination parameters worked
        expect(parsed.items).toBeDefined();
        expect(Array.isArray(parsed.items)).toBe(true);
        expect(typeof parsed.total).toBe('number');
      }
    });

    it("should handle large pagination values", async () => {
      // Act - Request more items than likely exist
      const largePageTool = withCursorPagination({ ...GetMediaTypeFoldersTool, pageSize: 1000 });
      const result = await largePageTool.handler(
        {},
        createMockRequestHandlerExtra()
      );

      // Assert - Validate response against tool's output schema
      const parsed = validateToolResponse(largePageTool, result);
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response is still valid
      expect(parsed.items).toBeDefined();
      expect(Array.isArray(parsed.items)).toBe(true);
      expect(typeof parsed.total).toBe('number');
      expect(parsed.total).toBeGreaterThanOrEqual(0);
    });

    it("should verify response structure and properties", async () => {
      // Act
      const result = await cursorTool.handler(
        {},
        createMockRequestHandlerExtra()
      );

      // Assert - Validate response against tool's output schema
      const parsed = validateToolResponse(cursorTool, result);

      // Verify response has correct structure
      expect(parsed).toHaveProperty('items');
      expect(parsed).toHaveProperty('total');
      expect(Array.isArray(parsed.items)).toBe(true);
      expect(typeof parsed.total).toBe('number');

      // If there are items, verify they have correct structure
      if (parsed.items.length > 0) {
        const firstItem = parsed.items[0];
        expect(firstItem).toHaveProperty('id');
        expect(firstItem).toHaveProperty('name');
        expect(firstItem).toHaveProperty('icon');

        expect(typeof firstItem.id).toBe('string');
        expect(typeof firstItem.name).toBe('string');
        // icon can be null or string
        expect(firstItem.icon === null || typeof firstItem.icon === 'string').toBe(true);
      }
    });
  });

  describe("edge cases", () => {
    it("should handle empty results when cursor exceeds available items", async () => {
      // Act - Request with high skip value via cursor to get empty results
      const result = await cursorTool.handler(
        { cursor: encodeCursor({ s: 10000, t: 10 }) },
        createMockRequestHandlerExtra()
      );

      // Assert - Validate response against tool's output schema
      const parsed = validateToolResponse(cursorTool, result);
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response structure is correct even with no results
      expect(parsed.items).toBeDefined();
      expect(Array.isArray(parsed.items)).toBe(true);
      expect(parsed.items).toHaveLength(0);
      expect(typeof parsed.total).toBe('number');
      expect(parsed.total).toBeGreaterThanOrEqual(0);
    });

    it("should handle boundary pagination values", async () => {
      // Arrange - First get the total number of items
      const firstResult = await cursorTool.handler(
        {},
        createMockRequestHandlerExtra()
      );

      const firstParsed = validateToolResponse(cursorTool, firstResult);
      const totalItems = firstParsed.total;

      // Act - Test boundary case where skip equals total items
      const result = await cursorTool.handler(
        { cursor: encodeCursor({ s: totalItems, t: 10 }) },
        createMockRequestHandlerExtra()
      );

      // Assert - Validate response against tool's output schema
      const parsed = validateToolResponse(cursorTool, result);
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify empty results but valid structure
      expect(parsed.items).toHaveLength(0);
      expect(parsed.total).toBe(totalItems);
    });

    it("should handle pagination with small page size", async () => {
      // Act - Test with small pagination window
      const smallPageTool = withCursorPagination({ ...GetMediaTypeFoldersTool, pageSize: 1 });
      const result = await smallPageTool.handler(
        {},
        createMockRequestHandlerExtra()
      );

      // Assert - Validate response against tool's output schema
      const parsed = validateToolResponse(smallPageTool, result);
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      expect(parsed.items.length).toBeLessThanOrEqual(1);
      expect(typeof parsed.total).toBe('number');
      expect(parsed.total).toBeGreaterThanOrEqual(0);
    });
  });
});
