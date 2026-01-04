import GetMediaTypeFoldersTool from "../items/get/get-media-type-folders.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("get-media-type-folders", () => {
  setupTestEnvironment();

  describe("successful retrieval", () => {
    it("should get media type folders with default pagination", async () => {
      // Act
      const result = await GetMediaTypeFoldersTool.handler(
        { take: 100 } as any,
        createMockRequestHandlerExtra()
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response structure
      const parsed = result.structuredContent as any;
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
        { skip: 0, take: 5 } as any,
        createMockRequestHandlerExtra()
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify pagination worked
      const parsed = result.structuredContent as any;
      expect(parsed.items.length).toBeLessThanOrEqual(5);
      expect(typeof parsed.total).toBe('number');
    });

    it("should get media type folders with skip parameter", async () => {
      // Act - Skip first item
      const result = await GetMediaTypeFoldersTool.handler(
        { skip: 1, take: 10 } as any,
        createMockRequestHandlerExtra()
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify pagination parameters worked
      const parsed = result.structuredContent as any;
      expect(parsed.items).toBeDefined();
      expect(Array.isArray(parsed.items)).toBe(true);
      expect(typeof parsed.total).toBe('number');
    });

    it("should handle large pagination values", async () => {
      // Act - Request more items than likely exist
      const result = await GetMediaTypeFoldersTool.handler(
        { skip: 0, take: 1000 } as any,
        createMockRequestHandlerExtra()
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response is still valid
      const parsed = result.structuredContent as any;
      expect(parsed.items).toBeDefined();
      expect(Array.isArray(parsed.items)).toBe(true);
      expect(typeof parsed.total).toBe('number');
      expect(parsed.total).toBeGreaterThanOrEqual(0);
    });

    it("should verify response structure and properties", async () => {
      // Act
      const result = await GetMediaTypeFoldersTool.handler(
        { skip: 0, take: 100 } as any,
        createMockRequestHandlerExtra()
      );

      // Assert
      const parsed = result.structuredContent as any;

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
    it("should handle empty results when skip exceeds available items", async () => {
      // Act - Request with high skip value to get empty results
      const result = await GetMediaTypeFoldersTool.handler(
        { skip: 10000, take: 10 } as any,
        createMockRequestHandlerExtra()
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response structure is correct even with no results
      const parsed = result.structuredContent as any;
      expect(parsed.items).toBeDefined();
      expect(Array.isArray(parsed.items)).toBe(true);
      expect(parsed.items).toHaveLength(0);
      expect(typeof parsed.total).toBe('number');
      expect(parsed.total).toBeGreaterThanOrEqual(0);
    });

    it("should handle zero take parameter", async () => {
      // Act
      const result = await GetMediaTypeFoldersTool.handler(
        { skip: 0, take: 0 } as any,
        createMockRequestHandlerExtra()
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify no items returned but total is still available
      const parsed = result.structuredContent as any;
      expect(parsed.items).toHaveLength(0);
      expect(typeof parsed.total).toBe('number');
      expect(parsed.total).toBeGreaterThanOrEqual(0);
    });

    it("should handle boundary pagination values", async () => {
      // Arrange - First get the total number of items
      const firstResult = await GetMediaTypeFoldersTool.handler(
        { skip: 0, take: 100 } as any,
        createMockRequestHandlerExtra()
      );

      const firstParsed = firstResult.structuredContent as any;
      const totalItems = firstParsed.total;

      // Act - Test boundary case where skip equals total items
      const result = await GetMediaTypeFoldersTool.handler(
        { skip: totalItems, take: 10 } as any,
        createMockRequestHandlerExtra()
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify empty results but valid structure
      const parsed = result.structuredContent as any;
      expect(parsed.items).toHaveLength(0);
      expect(parsed.total).toBe(totalItems);
    });

    it("should handle pagination with skip and small take values", async () => {
      // Act - Test with small pagination window
      const result = await GetMediaTypeFoldersTool.handler(
        { skip: 0, take: 1 } as any,
        createMockRequestHandlerExtra()
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      const parsed = result.structuredContent as any;
      expect(parsed.items.length).toBeLessThanOrEqual(1);
      expect(typeof parsed.total).toBe('number');
      expect(parsed.total).toBeGreaterThanOrEqual(0);
    });
  });
});
