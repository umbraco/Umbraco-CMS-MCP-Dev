import GetStaticFileAncestorsTool from "../items/get/get-ancestors.js";
import { StaticFileHelper } from "./helpers/static-file-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const INVALID_DESCENDANT_PATH = "/nonexistent/invalid/path/file.txt";

describe("get-static-file-ancestors", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    // StaticFile is read-only, no cleanup needed
  });

  it("should get ancestors for a nested file or folder", async () => {
    // Arrange - try to find a deeply nested file/folder by exploring the file system
    let testPath: string | undefined = undefined;

    // First, get root items
    const rootItems = await StaticFileHelper.getRootItems();
    const rootFolder = rootItems.find(item => item.isFolder);

    if (rootFolder) {
      // Get children of the root folder
      const children = await StaticFileHelper.getChildren(rootFolder.path);
      const nestedItem = children.find(item => item.path !== rootFolder.path);

      if (nestedItem) {
        testPath = nestedItem.path;
      }
    }

    if (!testPath) {
      // If we can't find a nested item, use a common nested path that likely exists
      testPath = "/App_Plugins/UmbracoEmbeddedResource/BackOffice/Default/css/application.css";
    }

    const params = {
      descendantPath: testPath
    };

    // Act
    const result = await GetStaticFileAncestorsTool().handler(
      params,
      { signal: new AbortController().signal }
    );

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify response structure
    const ancestors = JSON.parse(result.content[0].text?.toString() ?? "[]");
    expect(Array.isArray(ancestors)).toBe(true);

    // Verify file system structure if ancestors exist
    if (ancestors.length > 0) {
      // Note: ancestors may include items without all expected properties, so verify basic structure
      ancestors.forEach((ancestor: any) => {
        expect(ancestor).toHaveProperty('path');
        expect(ancestor).toHaveProperty('name');
        expect(typeof ancestor.path).toBe('string');
        expect(typeof ancestor.name).toBe('string');
      });

      // Ancestors should be ordered from root to parent (breadcrumb order)
      // Each ancestor should be a parent of the descendant path
      ancestors.forEach((ancestor: any, index: number) => {
        expect(ancestor).toHaveProperty('path');
        expect(ancestor).toHaveProperty('name');
        expect(ancestor).toHaveProperty('isFolder');
        expect(ancestor.isFolder).toBe(true); // All ancestors should be folders

        // The descendant path should contain the ancestor path
        expect(testPath).toContain(ancestor.path);

        // Each successive ancestor should have a longer path (deeper nesting)
        if (index > 0) {
          const previousAncestor = ancestors[index - 1];
          expect(ancestor.path.length).toBeGreaterThan(previousAncestor.path.length);
        }
      });
    }
  });

  it("should handle root-level item path gracefully", async () => {
    // Arrange - use a root-level item
    const rootItems = await StaticFileHelper.getRootItems();
    const rootItem = rootItems[0]; // Get first root item if it exists

    if (!rootItem) {
      console.log("No root items found, using fallback path");
      // Use a fallback root-level path
      const params = { descendantPath: "/App_Plugins" };

      const result = await GetStaticFileAncestorsTool().handler(
        params,
        { signal: new AbortController().signal }
      );

      expect(result).toMatchSnapshot();
      return;
    }

    const params = {
      descendantPath: rootItem.path
    };

    // Act
    const result = await GetStaticFileAncestorsTool().handler(
      params,
      { signal: new AbortController().signal }
    );

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Root-level items should have minimal ancestors (possibly just root "/")
    const ancestors = JSON.parse(result.content[0].text?.toString() ?? "[]");
    expect(Array.isArray(ancestors)).toBe(true);

    // For root items, ancestors should be minimal (may include root and the item itself)
    expect(ancestors.length).toBeLessThanOrEqual(3);
  });

  it.skip("should handle invalid descendant path gracefully", async () => {
    // Arrange
    const params = {
      descendantPath: INVALID_DESCENDANT_PATH
    };

    // Act
    const result = await GetStaticFileAncestorsTool().handler(
      params,
      { signal: new AbortController().signal }
    );

    // Assert - should not fail, may return empty array or handle gracefully
    expect(result).toMatchSnapshot();

    const ancestors = JSON.parse(result.content[0].text?.toString() ?? "[]");
    expect(Array.isArray(ancestors)).toBe(true);
    // Invalid path should typically return empty ancestors
    expect(ancestors.length).toBe(0);
  });

  it.skip("should return ancestors with proper breadcrumb properties", async () => {
    // Arrange - find a nested path by exploring the file system
    let deepPath: string | undefined = undefined;

    try {
      // Try to find a deeply nested file by recursively exploring
      const foundItem = await StaticFileHelper.findItemRecursively("application.css");
      if (foundItem) {
        deepPath = foundItem.path;
      }
    } catch (error) {
      console.log("Could not find nested file, using fallback path");
    }

    if (!deepPath) {
      // Use a common deep path that likely exists in Umbraco
      deepPath = "/App_Plugins/UmbracoEmbeddedResource/BackOffice/css/application.css";
    }

    const params = {
      descendantPath: deepPath
    };

    // Act
    const result = await GetStaticFileAncestorsTool().handler(
      params,
      { signal: new AbortController().signal }
    );

    // Assert
    const ancestors = JSON.parse(result.content[0].text?.toString() ?? "[]");

    if (ancestors.length > 0) {
      // Check first ancestor has expected structure
      const firstAncestor = ancestors[0];
      expect(firstAncestor).toHaveProperty('path');
      expect(firstAncestor).toHaveProperty('name');
      expect(firstAncestor).toHaveProperty('isFolder');
      expect(typeof firstAncestor.path).toBe('string');
      expect(typeof firstAncestor.name).toBe('string');
      expect(typeof firstAncestor.isFolder).toBe('boolean');
      expect(firstAncestor.isFolder).toBe(true); // All ancestors must be folders

      // Ancestors should form a valid breadcrumb trail
      // Each ancestor's path should be a prefix of the descendant path
      ancestors.forEach((ancestor: any) => {
        expect(deepPath).toMatch(new RegExp(`^${ancestor.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
      });

      // The last ancestor could be the item itself or its parent
      if (ancestors.length > 1) {
        const lastAncestor = ancestors[ancestors.length - 1];
        // The descendant path should match or start with the last ancestor's path
        expect(
          deepPath === lastAncestor.path ||
          deepPath.startsWith(lastAncestor.path + '/') ||
          deepPath.startsWith(lastAncestor.path)
        ).toBe(true);
      }
    }
  });

  it.skip("should handle empty or root descendant path", async () => {
    // Arrange - test with root path
    const params = {
      descendantPath: "/"
    };

    // Act
    const result = await GetStaticFileAncestorsTool().handler(
      params,
      { signal: new AbortController().signal }
    );

    // Assert - root should have no ancestors
    expect(result).toMatchSnapshot();

    const ancestors = JSON.parse(result.content[0].text?.toString() ?? "[]");
    expect(Array.isArray(ancestors)).toBe(true);
    expect(ancestors.length).toBe(0); // Root has no ancestors
  });

  it("should have consistent behavior with helper method", async () => {
    // Arrange - find a nested path to test with
    let testPath: string | undefined = undefined;

    const rootItems = await StaticFileHelper.getRootItems();
    const rootFolder = rootItems.find(item => item.isFolder);

    if (rootFolder) {
      const children = await StaticFileHelper.getChildren(rootFolder.path);
      const nestedItem = children.find(item => item.path !== rootFolder.path);
      if (nestedItem) {
        testPath = nestedItem.path;
      }
    }

    if (!testPath) {
      testPath = "/App_Plugins/UmbracoEmbeddedResource";
    }

    const params = { descendantPath: testPath };

    // Act - get results from both tool and helper
    const toolResult = await GetStaticFileAncestorsTool().handler(
      params,
      { signal: new AbortController().signal }
    );

    const helperResult = await StaticFileHelper.getAncestors(testPath);

    // Assert - both should return the same ancestors
    const toolAncestors = JSON.parse(toolResult.content[0].text?.toString() ?? "[]");

    expect(toolAncestors.length).toBe(helperResult.length);

    // If both have ancestors, verify they match
    if (toolAncestors.length > 0 && helperResult.length > 0) {
      // Check that first ancestor from tool matches first ancestor from helper
      const toolFirstAncestor = toolAncestors[0];
      const helperFirstAncestor = helperResult[0];

      expect(toolFirstAncestor.path).toBe(helperFirstAncestor.path);
      expect(toolFirstAncestor.name).toBe(helperFirstAncestor.name);
      expect(toolFirstAncestor.isFolder).toBe(helperFirstAncestor.isFolder);
    }
  });

  it("should handle deeply nested paths correctly", async () => {
    // Arrange - construct a path that should have multiple ancestors
    const deepPath = "/App_Plugins/UmbracoEmbeddedResource/BackOffice/css/application.css";

    const params = {
      descendantPath: deepPath
    };

    // Act
    const result = await GetStaticFileAncestorsTool().handler(
      params,
      { signal: new AbortController().signal }
    );

    // Assert
    const ancestors = JSON.parse(result.content[0].text?.toString() ?? "[]");
    expect(Array.isArray(ancestors)).toBe(true);

    if (ancestors.length > 0) {
      // Verify ancestors are in correct breadcrumb order (root to parent)
      let previousPath = "";
      ancestors.forEach((ancestor: any, index: number) => {
        // Each successive ancestor should have a path that builds on the previous one
        if (index > 0) {
          // The current path should start with the previous path (with or without trailing slash)
          expect(
            ancestor.path.startsWith(previousPath) ||
            ancestor.path.startsWith(previousPath + '/') ||
            (previousPath === '/' && ancestor.path.startsWith('/'))
          ).toBe(true);
        }
        previousPath = ancestor.path;

        // Each ancestor path should be a prefix of the deep path
        expect(deepPath).toMatch(new RegExp(`^${ancestor.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));

        // All ancestors should be folders
        expect(ancestor.isFolder).toBe(true);
      });
    }
  });
});