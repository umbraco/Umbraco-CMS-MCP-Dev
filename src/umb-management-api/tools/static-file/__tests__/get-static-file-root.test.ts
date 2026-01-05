import GetStaticFileRootTool from "../items/get/get-root.js";
import { StaticFileHelper } from "./helpers/static-file-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const DEFAULT_TAKE = 100;
const SMALL_TAKE = 5;
const LARGE_SKIP = 1000;

describe("get-static-file-root", () => {
  setupTestEnvironment();

  it.skip("should get root-level static files and folders with default pagination", async () => {
    // Arrange
    const params = {
      skip: 0,
      take: DEFAULT_TAKE
    };

    // Act
    const result = await GetStaticFileRootTool.handler(
      params,
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify response structure
    const response = result.structuredContent as { items: any[], total: number } | undefined;
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response?.items)).toBe(true);

    // Verify pagination properties
    expect(response).toHaveProperty('total');
    expect(typeof response?.total).toBe('number');

    // Verify file system structure if items exist
    if (response?.items && response.items.length > 0) {
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

  it.skip("should handle pagination with small take parameter", async () => {
    // Arrange - get a small number of items
    const params = {
      skip: 0,
      take: SMALL_TAKE
    };

    // Act
    const result = await GetStaticFileRootTool.handler(
      params,
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify response structure
    const response = result.structuredContent as { items: any[], total: number } | undefined;
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response?.items)).toBe(true);

    // If there are items, should not exceed the take parameter
    if (response?.items && response.items.length > 0) {
      expect(response.items.length).toBeLessThanOrEqual(SMALL_TAKE);

      const isValidStructure = StaticFileHelper.verifyFileSystemStructure(response.items);
      expect(isValidStructure).toBe(true);
    }
  });

  it.skip("should handle pagination with skip parameter", async () => {
    // Arrange - first get total count to determine valid skip
    const initialResult = await GetStaticFileRootTool.handler(
      { skip: 0, take: DEFAULT_TAKE },
      createMockRequestHandlerExtra()
    );

    const initialResponse = initialResult.structuredContent as { items: any[], total: number } | undefined;
    const totalItems = initialResponse?.total || 0;

    // Only test skip if there are items
    if (totalItems > 1) {
      const skipValue = Math.min(1, totalItems - 1); // Skip at least 1 but not beyond total
      const params = {
        skip: skipValue,
        take: DEFAULT_TAKE
      };

      // Act
      const result = await GetStaticFileRootTool.handler(
        params,
        createMockRequestHandlerExtra()
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response structure
      const response = result.structuredContent as { items: any[], total: number } | undefined;
      expect(response).toHaveProperty('items');
      expect(Array.isArray(response?.items)).toBe(true);
      expect(response?.total).toBe(totalItems); // Total should remain same

      // Verify file system structure if items exist
      if (response?.items && response.items.length > 0) {
        const isValidStructure = StaticFileHelper.verifyFileSystemStructure(response.items);
        expect(isValidStructure).toBe(true);
      }
    } else {
      // If no items or only one item, just test the skip behavior doesn't break
      const params = {
        skip: 1,
        take: DEFAULT_TAKE
      };

      const result = await GetStaticFileRootTool.handler(
        params,
        createMockRequestHandlerExtra()
      );

      expect(result).toMatchSnapshot();
    }
  });

  it.skip("should handle large skip value gracefully", async () => {
    // Arrange - skip beyond available items
    const params = {
      skip: LARGE_SKIP,
      take: DEFAULT_TAKE
    };

    // Act
    const result = await GetStaticFileRootTool.handler(
      params,
      createMockRequestHandlerExtra()
    );

    // Assert - should not fail, should return empty items array
    expect(result).toMatchSnapshot();

    const response = result.structuredContent as { items: any[], total: number } | undefined;
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response?.items)).toBe(true);
    expect(response?.items.length).toBe(0); // Should be empty due to large skip
    expect(response).toHaveProperty('total');
    expect(typeof response?.total).toBe('number');
  });

  it.skip("should handle zero take parameter", async () => {
    // Arrange
    const params = {
      skip: 0,
      take: 0
    };

    // Act
    const result = await GetStaticFileRootTool.handler(
      params,
      createMockRequestHandlerExtra()
    );

    // Assert - should return empty items but still have total count
    expect(result).toMatchSnapshot();

    const response = result.structuredContent as { items: any[], total: number } | undefined;
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response?.items)).toBe(true);
    expect(response?.items.length).toBe(0); // Should be empty due to take: 0
    expect(response).toHaveProperty('total');
    expect(typeof response?.total).toBe('number');
  });

  it("should return items with proper file system properties for root items", async () => {
    // Arrange
    const params = {
      skip: 0,
      take: DEFAULT_TAKE
    };

    // Act
    const result = await GetStaticFileRootTool.handler(
      params,
      createMockRequestHandlerExtra()
    );

    // Assert
    const response = result.structuredContent as { items: any[], total: number } | undefined;

    if (response?.items && response.items.length > 0) {
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
    const toolResult = await GetStaticFileRootTool.handler(
      params,
      createMockRequestHandlerExtra()
    );

    const helperResult = await StaticFileHelper.getRootItems(skip, take);

    // Assert - both should return the same items
    const toolResponse = toolResult.structuredContent as { items: any[], total: number } | undefined;

    expect(toolResponse?.items.length).toBe(helperResult.length);

    // If both have items, verify they match
    if (toolResponse?.items && toolResponse.items.length > 0 && helperResult.length > 0) {
      // Check that first item from tool matches first item from helper
      const toolFirstItem = toolResponse.items[0];
      const helperFirstItem = helperResult[0];

      expect(toolFirstItem.path).toBe(helperFirstItem.path);
      expect(toolFirstItem.name).toBe(helperFirstItem.name);
      expect(toolFirstItem.isFolder).toBe(helperFirstItem.isFolder);
    }
  });
});
