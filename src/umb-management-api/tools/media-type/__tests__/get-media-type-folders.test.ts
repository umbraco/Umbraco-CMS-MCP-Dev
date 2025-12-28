import GetMediaTypeFoldersTool from "../items/get/get-media-type-folders.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

describe("get-media-type-folders", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe("successful retrieval", () => {
    it("should get media type folders with default pagination", async () => {
      // Act
      const result = await GetMediaTypeFoldersTool.handler(
        { take: 100 },
        { signal: new AbortController().signal }
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response structure
      const parsed = JSON.parse(result.content[0].text as string);
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
        { skip: 0, take: 5 },
        { signal: new AbortController().signal }
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify pagination worked
      const parsed = JSON.parse(result.content[0].text as string);
      expect(parsed.items.length).toBeLessThanOrEqual(5);
      expect(typeof parsed.total).toBe('number');
    });

    it("should get media type folders with skip parameter", async () => {
      // Act - Skip first item
      const result = await GetMediaTypeFoldersTool.handler(
        { skip: 1, take: 10 },
        { signal: new AbortController().signal }
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify pagination parameters worked
      const parsed = JSON.parse(result.content[0].text as string);
      expect(parsed.items).toBeDefined();
      expect(Array.isArray(parsed.items)).toBe(true);
      expect(typeof parsed.total).toBe('number');
    });

    it("should handle large pagination values", async () => {
      // Act - Request more items than likely exist
      const result = await GetMediaTypeFoldersTool.handler(
        { skip: 0, take: 1000 },
        { signal: new AbortController().signal }
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response is still valid
      const parsed = JSON.parse(result.content[0].text as string);
      expect(parsed.items).toBeDefined();
      expect(Array.isArray(parsed.items)).toBe(true);
      expect(typeof parsed.total).toBe('number');
      expect(parsed.total).toBeGreaterThanOrEqual(0);
    });

    it("should verify response structure and properties", async () => {
      // Act
      const result = await GetMediaTypeFoldersTool.handler(
        { skip: 0, take: 100 },
        { signal: new AbortController().signal }
      );

      // Assert
      const parsed = JSON.parse(result.content[0].text as string);

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
        { skip: 10000, take: 10 },
        { signal: new AbortController().signal }
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response structure is correct even with no results
      const parsed = JSON.parse(result.content[0].text as string);
      expect(parsed.items).toBeDefined();
      expect(Array.isArray(parsed.items)).toBe(true);
      expect(parsed.items).toHaveLength(0);
      expect(typeof parsed.total).toBe('number');
      expect(parsed.total).toBeGreaterThanOrEqual(0);
    });

    it("should handle zero take parameter", async () => {
      // Act
      const result = await GetMediaTypeFoldersTool.handler(
        { skip: 0, take: 0 },
        { signal: new AbortController().signal }
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify no items returned but total is still available
      const parsed = JSON.parse(result.content[0].text as string);
      expect(parsed.items).toHaveLength(0);
      expect(typeof parsed.total).toBe('number');
      expect(parsed.total).toBeGreaterThanOrEqual(0);
    });

    it("should handle boundary pagination values", async () => {
      // Arrange - First get the total number of items
      const firstResult = await GetMediaTypeFoldersTool.handler(
        { skip: 0, take: 100 },
        { signal: new AbortController().signal }
      );

      const firstParsed = JSON.parse(firstResult.content[0].text as string);
      const totalItems = firstParsed.total;

      // Act - Test boundary case where skip equals total items
      const result = await GetMediaTypeFoldersTool.handler(
        { skip: totalItems, take: 10 },
        { signal: new AbortController().signal }
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify empty results but valid structure
      const parsed = JSON.parse(result.content[0].text as string);
      expect(parsed.items).toHaveLength(0);
      expect(parsed.total).toBe(totalItems);
    });

    it("should handle pagination with skip and small take values", async () => {
      // Act - Test with small pagination window
      const result = await GetMediaTypeFoldersTool.handler(
        { skip: 0, take: 1 },
        { signal: new AbortController().signal }
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      const parsed = JSON.parse(result.content[0].text as string);
      expect(parsed.items.length).toBeLessThanOrEqual(1);
      expect(typeof parsed.total).toBe('number');
      expect(parsed.total).toBeGreaterThanOrEqual(0);
    });
  });
});