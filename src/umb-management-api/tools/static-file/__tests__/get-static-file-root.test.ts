import GetStaticFileRootTool from "../items/get/get-root.js";
import { StaticFileHelper } from "./helpers/static-file-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const DEFAULT_TAKE = 100;
const SMALL_TAKE = 5;
const LARGE_SKIP = 1000;

describe("get-static-file-root", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    // StaticFile is read-only, no cleanup needed
  });

  it("should get root-level static files and folders with default pagination", async () => {
    // Arrange
    const params = {
      skip: 0,
      take: DEFAULT_TAKE
    };

    // Act
    const result = await GetStaticFileRootTool().handler(
      params,
      { signal: new AbortController().signal }
    );

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify response structure
    const response = JSON.parse(result.content[0].text?.toString() ?? "{}");
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response.items)).toBe(true);

    // Verify pagination properties
    expect(response).toHaveProperty('total');
    expect(typeof response.total).toBe('number');

    // Verify file system structure if items exist
    if (response.items.length > 0) {
      const isValidStructure = StaticFileHelper.verifyFileSystemStructure(response.items);
      expect(isValidStructure).toBe(true);

      // Verify items at root level (parent should be root "/")
      response.items.forEach((item: any) => {
        if (item.parent) {
          expect(item.parent.path).toBe("/");
        }
      });
    }
  });

  it("should handle pagination with small take parameter", async () => {
    // Arrange - get a small number of items
    const params = {
      skip: 0,
      take: SMALL_TAKE
    };

    // Act
    const result = await GetStaticFileRootTool().handler(
      params,
      { signal: new AbortController().signal }
    );

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify response structure
    const response = JSON.parse(result.content[0].text?.toString() ?? "{}");
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response.items)).toBe(true);

    // If there are items, should not exceed the take parameter
    if (response.items.length > 0) {
      expect(response.items.length).toBeLessThanOrEqual(SMALL_TAKE);

      const isValidStructure = StaticFileHelper.verifyFileSystemStructure(response.items);
      expect(isValidStructure).toBe(true);
    }
  });

  it("should handle pagination with skip parameter", async () => {
    // Arrange - first get total count to determine valid skip
    const initialResult = await GetStaticFileRootTool().handler(
      { skip: 0, take: DEFAULT_TAKE },
      { signal: new AbortController().signal }
    );

    const initialResponse = JSON.parse(initialResult.content[0].text?.toString() ?? "{}");
    const totalItems = initialResponse.total || 0;

    // Only test skip if there are items
    if (totalItems > 1) {
      const skipValue = Math.min(1, totalItems - 1); // Skip at least 1 but not beyond total
      const params = {
        skip: skipValue,
        take: DEFAULT_TAKE
      };

      // Act
      const result = await GetStaticFileRootTool().handler(
        params,
        { signal: new AbortController().signal }
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response structure
      const response = JSON.parse(result.content[0].text?.toString() ?? "{}");
      expect(response).toHaveProperty('items');
      expect(Array.isArray(response.items)).toBe(true);
      expect(response.total).toBe(totalItems); // Total should remain same

      // Verify file system structure if items exist
      if (response.items.length > 0) {
        const isValidStructure = StaticFileHelper.verifyFileSystemStructure(response.items);
        expect(isValidStructure).toBe(true);
      }
    } else {
      // If no items or only one item, just test the skip behavior doesn't break
      const params = {
        skip: 1,
        take: DEFAULT_TAKE
      };

      const result = await GetStaticFileRootTool().handler(
        params,
        { signal: new AbortController().signal }
      );

      expect(result).toMatchSnapshot();
    }
  });

  it("should handle large skip value gracefully", async () => {
    // Arrange - skip beyond available items
    const params = {
      skip: LARGE_SKIP,
      take: DEFAULT_TAKE
    };

    // Act
    const result = await GetStaticFileRootTool().handler(
      params,
      { signal: new AbortController().signal }
    );

    // Assert - should not fail, should return empty items array
    expect(result).toMatchSnapshot();

    const response = JSON.parse(result.content[0].text?.toString() ?? "{}");
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response.items)).toBe(true);
    expect(response.items.length).toBe(0); // Should be empty due to large skip
    expect(response).toHaveProperty('total');
    expect(typeof response.total).toBe('number');
  });

  it("should handle zero take parameter", async () => {
    // Arrange
    const params = {
      skip: 0,
      take: 0
    };

    // Act
    const result = await GetStaticFileRootTool().handler(
      params,
      { signal: new AbortController().signal }
    );

    // Assert - should return empty items but still have total count
    expect(result).toMatchSnapshot();

    const response = JSON.parse(result.content[0].text?.toString() ?? "{}");
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response.items)).toBe(true);
    expect(response.items.length).toBe(0); // Should be empty due to take: 0
    expect(response).toHaveProperty('total');
    expect(typeof response.total).toBe('number');
  });

  it("should return items with proper file system properties for root items", async () => {
    // Arrange
    const params = {
      skip: 0,
      take: DEFAULT_TAKE
    };

    // Act
    const result = await GetStaticFileRootTool().handler(
      params,
      { signal: new AbortController().signal }
    );

    // Assert
    const response = JSON.parse(result.content[0].text?.toString() ?? "{}");

    if (response.items.length > 0) {
      // Check first item has expected structure
      const firstItem = response.items[0];
      expect(firstItem).toHaveProperty('path');
      expect(firstItem).toHaveProperty('name');
      expect(firstItem).toHaveProperty('isFolder');
      expect(typeof firstItem.path).toBe('string');
      expect(typeof firstItem.name).toBe('string');
      expect(typeof firstItem.isFolder).toBe('boolean');

      // Root items should have parent with path "/"
      if (firstItem.parent) {
        expect(firstItem.parent.path).toBe("/");
      }

      // Path should have a leading slash for root items
      expect(firstItem.path).toBe(`/${firstItem.name}`);
    }
  });

  it("should have consistent pagination behavior with helper method", async () => {
    // Arrange - compare tool result with helper result
    const skip = 0;
    const take = DEFAULT_TAKE;
    const params = { skip, take };

    // Act - get results from both tool and helper
    const toolResult = await GetStaticFileRootTool().handler(
      params,
      { signal: new AbortController().signal }
    );

    const helperResult = await StaticFileHelper.getRootItems(skip, take);

    // Assert - both should return the same items
    const toolResponse = JSON.parse(toolResult.content[0].text?.toString() ?? "{}");

    expect(toolResponse.items.length).toBe(helperResult.length);

    // If both have items, verify they match
    if (toolResponse.items.length > 0 && helperResult.length > 0) {
      // Check that first item from tool matches first item from helper
      const toolFirstItem = toolResponse.items[0];
      const helperFirstItem = helperResult[0];

      expect(toolFirstItem.path).toBe(helperFirstItem.path);
      expect(toolFirstItem.name).toBe(helperFirstItem.name);
      expect(toolFirstItem.isFolder).toBe(helperFirstItem.isFolder);
    }
  });
});