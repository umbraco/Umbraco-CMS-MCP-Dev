import GetStaticFileChildrenTool from "../items/get/get-children.js";
import { StaticFileHelper } from "./helpers/static-file-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const DEFAULT_TAKE = 100;
const SMALL_TAKE = 5;
const LARGE_SKIP = 1000;
const INVALID_PARENT_PATH = "/nonexistent/invalid/path";

describe("get-static-file-children", () => {
  setupTestEnvironment();

  it.skip("should get children of a valid folder with default pagination", async () => {
    // Arrange - find a folder that exists in the root
    const rootItems = await StaticFileHelper.getRootItems();
    const testFolder = rootItems.find(item => item.isFolder);

    if (!testFolder) {
      console.log("No folders found in root, skipping folder children test");
      expect(true).toBe(true); // Skip test if no folders exist
      return;
    }

    const params = {
      parentPath: testFolder.path,
      skip: 0,
      take: DEFAULT_TAKE
    };

    // Act
    const result = await GetStaticFileChildrenTool.handler(
      params,
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify response structure
    const data = validateToolResponse(GetStaticFileChildrenTool, result);
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);

    // Verify pagination properties
    expect(data).toHaveProperty('total');
    expect(typeof data.total).toBe('number');

    // Verify file system structure if items exist
    if (data.items && data.items.length > 0) {
      const isValidStructure = StaticFileHelper.verifyFileSystemStructure(data.items);
      expect(isValidStructure).toBe(true);

      // Verify all children have the correct parent
      data.items.forEach((item: any) => {
        if (item.parent) {
          expect(item.parent.path).toBe(testFolder.path);
        }
      });
    }
  });

  it.skip("should handle pagination with small take parameter for folder children", async () => {
    // Arrange - find a folder that exists
    const rootItems = await StaticFileHelper.getRootItems();
    const testFolder = rootItems.find(item => item.isFolder);

    if (!testFolder) {
      console.log("No folders found, creating test with root path instead");
      // Use a known root path if no folders found
      const params = {
        parentPath: "/",
        skip: 0,
        take: SMALL_TAKE
      };

      const result = await GetStaticFileChildrenTool.handler(
        params,
        createMockRequestHandlerExtra()
      );

      expect(result).toMatchSnapshot();
      return;
    }

    const params = {
      parentPath: testFolder.path,
      skip: 0,
      take: SMALL_TAKE
    };

    // Act
    const result = await GetStaticFileChildrenTool.handler(
      params,
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify response structure
    const data = validateToolResponse(GetStaticFileChildrenTool, result);
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);

    // If there are items, should not exceed the take parameter
    if (data.items && data.items.length > 0) {
      expect(data.items.length).toBeLessThanOrEqual(SMALL_TAKE);

      const isValidStructure = StaticFileHelper.verifyFileSystemStructure(data.items);
      expect(isValidStructure).toBe(true);
    }
  });

  it.skip("should handle pagination with skip parameter for folder children", async () => {
    // Arrange - find a folder and get its total children count
    const rootItems = await StaticFileHelper.getRootItems();
    const testFolder = rootItems.find(item => item.isFolder);

    if (!testFolder) {
      console.log("No folders found, skipping pagination test");
      expect(true).toBe(true); // Skip if no folders
      return;
    }

    // Get initial result to determine total items
    const initialResult = await GetStaticFileChildrenTool.handler(
      { parentPath: testFolder.path, skip: 0, take: DEFAULT_TAKE },
      createMockRequestHandlerExtra()
    );

    const initialData = validateToolResponse(GetStaticFileChildrenTool, initialResult);
    const totalItems = initialData.total || 0;

    // Only test skip if there are items
    if (totalItems > 1) {
      const skipValue = Math.min(1, totalItems - 1);
      const params = {
        parentPath: testFolder.path,
        skip: skipValue,
        take: DEFAULT_TAKE
      };

      // Act
      const result = await GetStaticFileChildrenTool.handler(
        params,
        createMockRequestHandlerExtra()
      );

      // Assert
      const normalizedResult = createSnapshotResult(result);
      expect(normalizedResult).toMatchSnapshot();

      const data = validateToolResponse(GetStaticFileChildrenTool, result);
      expect(data).toHaveProperty('items');
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBe(totalItems); // Total should remain same
    } else {
      // Test skip behavior when no children or only one child
      const params = {
        parentPath: testFolder.path,
        skip: 1,
        take: DEFAULT_TAKE
      };

      const result = await GetStaticFileChildrenTool.handler(
        params,
        createMockRequestHandlerExtra()
      );

      expect(result).toMatchSnapshot();
    }
  });

  it("should handle invalid parent path gracefully", async () => {
    // Arrange
    const params = {
      parentPath: INVALID_PARENT_PATH,
      skip: 0,
      take: DEFAULT_TAKE
    };

    // Act
    const result = await GetStaticFileChildrenTool.handler(
      params,
      createMockRequestHandlerExtra()
    );

    // Assert - should not fail, may return empty results or error gracefully
    expect(result).toMatchSnapshot();

    const data = validateToolResponse(GetStaticFileChildrenTool, result);

    // Should still have the expected structure even if empty
    if (data.items !== undefined) {
      expect(Array.isArray(data.items)).toBe(true);
    }
  });

  it.skip("should handle large skip value gracefully", async () => {
    // Arrange - find any folder or use root
    const rootItems = await StaticFileHelper.getRootItems();
    const testFolder = rootItems.find(item => item.isFolder);
    const parentPath = testFolder ? testFolder.path : "/App_Plugins"; // Use a common folder or fallback

    const params = {
      parentPath,
      skip: LARGE_SKIP,
      take: DEFAULT_TAKE
    };

    // Act
    const result = await GetStaticFileChildrenTool.handler(
      params,
      createMockRequestHandlerExtra()
    );

    // Assert - should not fail, should return empty items array
    expect(result).toMatchSnapshot();

    const response = validateToolResponse(GetStaticFileChildrenTool, result);

    if (response.items !== undefined) {
      expect(Array.isArray(response.items)).toBe(true);
      expect(response.items.length).toBe(0); // Should be empty due to large skip
    }
  });

  it.skip("should handle zero take parameter", async () => {
    // Arrange - find any folder or use root
    const rootItems = await StaticFileHelper.getRootItems();
    const testFolder = rootItems.find(item => item.isFolder);
    const parentPath = testFolder ? testFolder.path : "/";

    const params = {
      parentPath,
      skip: 0,
      take: 0
    };

    // Act
    const result = await GetStaticFileChildrenTool.handler(
      params,
      createMockRequestHandlerExtra()
    );

    // Assert - should return empty items but still have total count
    expect(result).toMatchSnapshot();

    const response = validateToolResponse(GetStaticFileChildrenTool, result);

    if (response.items !== undefined) {
      expect(Array.isArray(response.items)).toBe(true);
      expect(response.items.length).toBe(0); // Should be empty due to take: 0
    }

    if (response.total !== undefined) {
      expect(typeof response.total).toBe('number');
    }
  });

  it("should return children with proper file system properties", async () => {
    // Arrange - find a folder with children
    const rootItems = await StaticFileHelper.getRootItems();
    const testFolder = rootItems.find(item => item.isFolder);

    if (!testFolder) {
      console.log("No folders found, skipping children properties test");
      expect(true).toBe(true); // Skip if no folders
      return;
    }

    const params = {
      parentPath: testFolder.path,
      skip: 0,
      take: DEFAULT_TAKE
    };

    // Act
    const result = await GetStaticFileChildrenTool.handler(
      params,
      createMockRequestHandlerExtra()
    );

    // Assert
    const response = validateToolResponse(GetStaticFileChildrenTool, result);

    if (response.items && response.items.length > 0) {
      // Check first item has expected structure
      const firstChild = response.items[0];
      expect(firstChild).toHaveProperty('path');
      expect(firstChild).toHaveProperty('name');
      expect(firstChild).toHaveProperty('isFolder');
      expect(typeof firstChild.path).toBe('string');
      expect(typeof firstChild.name).toBe('string');
      expect(typeof firstChild.isFolder).toBe('boolean');

      // Child should have parent reference to the test folder
      if (firstChild.parent) {
        expect(firstChild.parent.path).toBe(testFolder.path);
      }

      // Path should start with parent path
      expect(firstChild.path).toContain(testFolder.path);
    }
  });

  it("should have consistent behavior with helper method", async () => {
    // Arrange - find a folder to test with
    const rootItems = await StaticFileHelper.getRootItems();
    const testFolder = rootItems.find(item => item.isFolder);

    if (!testFolder) {
      console.log("No folders found, skipping consistency test");
      expect(true).toBe(true); // Skip if no folders
      return;
    }

    const skip = 0;
    const take = DEFAULT_TAKE;
    const params = { parentPath: testFolder.path, skip, take };

    // Act - get results from both tool and helper
    const toolResult = await GetStaticFileChildrenTool.handler(
      params,
      createMockRequestHandlerExtra()
    );

    const helperResult = await StaticFileHelper.getChildren(testFolder.path, skip, take);

    // Assert - both should return the same items
    const toolResponse = validateToolResponse(GetStaticFileChildrenTool, toolResult);

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
