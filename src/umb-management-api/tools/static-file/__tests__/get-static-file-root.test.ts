import GetStaticFileRootTool from "../items/get/get-root.js";
import { StaticFileHelper } from "./helpers/static-file-helper.js";
import { withCursorPagination, encodeCursor } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const LARGE_SKIP = 1000;

describe("get-static-file-root", () => {
  setupTestEnvironment();

  const cursorTool = withCursorPagination(GetStaticFileRootTool);

  it.skip("should get root-level static files and folders with default pagination", async () => {
    // Act
    const result = await cursorTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify response structure
    const response = validateToolResponse(cursorTool, result);
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response.items)).toBe(true);

    // Verify pagination properties
    expect(response).toHaveProperty('total');
    expect(typeof response.total).toBe('number');

    // Verify file system structure if items exist
    if (response.items && response.items.length > 0) {
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

  it.skip("should handle pagination with small page size", async () => {
    // Act
    const smallPageTool = withCursorPagination({ ...GetStaticFileRootTool, pageSize: 5 });
    const result = await smallPageTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify response structure
    const response = validateToolResponse(smallPageTool, result);
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response.items)).toBe(true);

    // If there are items, should not exceed the page size
    if (response.items && response.items.length > 0) {
      expect(response.items.length).toBeLessThanOrEqual(5);

      const isValidStructure = StaticFileHelper.verifyFileSystemStructure(response.items);
      expect(isValidStructure).toBe(true);
    }
  });

  it.skip("should handle pagination with cursor for second page", async () => {
    // Arrange - first get initial page
    const initialResult = await cursorTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    const initialResponse = validateToolResponse(cursorTool, initialResult);
    const totalItems = initialResponse.total || 0;

    // Only test cursor if there are items and a next page
    if (totalItems > 1 && initialResponse.nextCursor) {
      // Act
      const result = await cursorTool.handler(
        { cursor: initialResponse.nextCursor },
        createMockRequestHandlerExtra()
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      // Verify response structure
      const response = validateToolResponse(cursorTool, result);
      expect(response).toHaveProperty('items');
      expect(Array.isArray(response.items)).toBe(true);
      expect(response.total).toBe(totalItems); // Total should remain same

      // Verify file system structure if items exist
      if (response.items && response.items.length > 0) {
        const isValidStructure = StaticFileHelper.verifyFileSystemStructure(response.items);
        expect(isValidStructure).toBe(true);
      }
    } else {
      // If no items or only one item, just test the cursor behavior doesn't break
      const result = await cursorTool.handler(
        { cursor: encodeCursor({ s: 1, t: 50 }) },
        createMockRequestHandlerExtra()
      );

      expect(result).toMatchSnapshot();
    }
  });

  it.skip("should handle large skip value gracefully", async () => {
    // Act - skip beyond available items via cursor
    const result = await cursorTool.handler(
      { cursor: encodeCursor({ s: LARGE_SKIP, t: 50 }) },
      createMockRequestHandlerExtra()
    );

    // Assert - should not fail, should return empty items array
    expect(result).toMatchSnapshot();

    const response = validateToolResponse(cursorTool, result);
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response.items)).toBe(true);
    expect(response.items.length).toBe(0); // Should be empty due to large skip
    expect(response).toHaveProperty('total');
    expect(typeof response.total).toBe('number');
  });

  it("should return items with proper file system properties for root items", async () => {
    // Act
    const result = await cursorTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert
    const response = validateToolResponse(cursorTool, result);

    if (response.items && response.items.length > 0) {
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
    const take = 100;

    // Act - get results from both tool and helper
    const toolResult = await cursorTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    const helperResult = await StaticFileHelper.getRootItems(skip, take);

    // Assert - both should return the same items
    const toolResponse = validateToolResponse(cursorTool, toolResult);

    expect(toolResponse.items.length).toBe(helperResult.length);

    // If both have items, verify they match
    if (toolResponse.items && toolResponse.items.length > 0 && helperResult.length > 0) {
      // Check that first item from tool matches first item from helper
      const toolFirstItem = toolResponse.items[0];
      const helperFirstItem = helperResult[0];

      expect(toolFirstItem.path).toBe(helperFirstItem.path);
      expect(toolFirstItem.name).toBe(helperFirstItem.name);
      expect(toolFirstItem.isFolder).toBe(helperFirstItem.isFolder);
    }
  });
});
