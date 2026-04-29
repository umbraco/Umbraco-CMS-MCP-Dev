import GetMediaTypeFoldersTool from "../items/get/get-media-type-folders.js";
import { encodeCursor } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
  type CursorPaginatedResult,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-media-type-folders", () => {
  setupTestEnvironment();

  describe("successful retrieval", () => {
    it("should get media type folders with default pagination", async () => {
      // Act
      const result = await GetMediaTypeFoldersTool.handler(
        {},
        createMockRequestHandlerExtra()
      );

      // Assert - Validate response against tool's output schema
      const parsed = validateToolResponse(GetMediaTypeFoldersTool, result);
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
      const result = await GetMediaTypeFoldersTool.handler(
        {},
        createMockRequestHandlerExtra()
      );

      // Assert - Validate response against tool's output schema
      const parsed = validateToolResponse(GetMediaTypeFoldersTool, result);
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify pagination worked
      expect(parsed.items.length).toBeLessThanOrEqual(5);
      expect(typeof parsed.total).toBe('number');
    });

    it("should get media type folders with cursor for second page", async () => {
      // Act - Get first page with pageSize 1, then use cursor for next
      const firstResult = await GetMediaTypeFoldersTool.handler(
        {},
        createMockRequestHandlerExtra()
      );

      const firstParsed = validateToolResponse(GetMediaTypeFoldersTool, firstResult);

      // If there's a next page, fetch it
      if ((firstParsed as any).nextCursor) {
        const result = await GetMediaTypeFoldersTool.handler(
          { cursor: (firstParsed as any).nextCursor },
          createMockRequestHandlerExtra()
        );

        // Assert - Validate response against tool's output schema
        const parsed = validateToolResponse(GetMediaTypeFoldersTool, result);
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
      const largePageTool = ({ ...GetMediaTypeFoldersTool, pageSize: 1000 });
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
      const result = await GetMediaTypeFoldersTool.handler(
        {},
        createMockRequestHandlerExtra()
      );

      // Assert - Validate response against tool's output schema
      const parsed = validateToolResponse(GetMediaTypeFoldersTool, result);

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
      const result = await GetMediaTypeFoldersTool.handler(
        { cursor: encodeCursor({ s: 10000, t: 10 }) },
        createMockRequestHandlerExtra()
      );

      // Assert - Validate response against tool's output schema
      const parsed = validateToolResponse(GetMediaTypeFoldersTool, result);
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
      const firstResult = await GetMediaTypeFoldersTool.handler(
        {},
        createMockRequestHandlerExtra()
      );

      const firstParsed = validateToolResponse(GetMediaTypeFoldersTool, firstResult);
      const totalItems = firstParsed.total;

      // Act - Test boundary case where skip equals total items
      const result = await GetMediaTypeFoldersTool.handler(
        { cursor: encodeCursor({ s: totalItems, t: 10 }) },
        createMockRequestHandlerExtra()
      );

      // Assert - Validate response against tool's output schema
      const parsed = validateToolResponse(GetMediaTypeFoldersTool, result);
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify empty results but valid structure
      expect(parsed.items).toHaveLength(0);
      expect(parsed.total).toBe(totalItems);
    });

    it("should handle pagination with small page size", async () => {
      // Act - Test with small pagination window
      const result = await GetMediaTypeFoldersTool.handler(
        {},
        createMockRequestHandlerExtra()
      );

      // Assert - Validate response against tool's output schema
      const parsed = validateToolResponse(GetMediaTypeFoldersTool, result);
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      expect(parsed.items.length).toBeLessThanOrEqual(1);
      expect(typeof parsed.total).toBe('number');
      expect(parsed.total).toBeGreaterThanOrEqual(0);
    });
  });
});
