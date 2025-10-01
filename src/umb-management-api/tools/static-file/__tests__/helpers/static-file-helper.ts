import { UmbracoManagementClient } from "@umb-management-client";
import { StaticFileItemResponseModel } from "@/umb-management-api/schemas/staticFileItemResponseModel.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

export class StaticFileHelper {
  /**
   * Find static files by path (optional filtering)
   */
  static async findStaticFiles(path?: string[]): Promise<StaticFileItemResponseModel[]> {
    try {
      const client = UmbracoManagementClient.getClient();
      const response = await client.getItemStaticFile({ path });
      return response;
    } catch (error) {
      console.error(`Error finding static files with path ${path}:`, error);
      return [];
    }
  }

  /**
   * Find a specific static file/folder by name
   */
  static findByName(
    items: StaticFileItemResponseModel[],
    name: string
  ): StaticFileItemResponseModel | undefined {
    return items.find((item) => item.name === name);
  }

  /**
   * Find a specific static file/folder by path
   */
  static findByPath(
    items: StaticFileItemResponseModel[],
    path: string
  ): StaticFileItemResponseModel | undefined {
    return items.find((item) => item.path === path);
  }

  /**
   * Get root-level static files and folders
   */
  static async getRootItems(skip = 0, take = 100): Promise<StaticFileItemResponseModel[]> {
    try {
      const client = UmbracoManagementClient.getClient();
      const response = await client.getTreeStaticFileRoot({ skip, take });
      return response.items;
    } catch (error) {
      console.error("Error getting static file root items:", error);
      return [];
    }
  }

  /**
   * Get children of a specific static file folder
   */
  static async getChildren(parentPath: string, skip = 0, take = 100): Promise<StaticFileItemResponseModel[]> {
    try {
      const client = UmbracoManagementClient.getClient();
      const response = await client.getTreeStaticFileChildren({ parentPath, skip, take });
      return response.items;
    } catch (error) {
      console.error(`Error getting children for static file path ${parentPath}:`, error);
      return [];
    }
  }

  /**
   * Get ancestors for a specific static file path
   */
  static async getAncestors(descendantPath: string): Promise<StaticFileItemResponseModel[]> {
    try {
      const client = UmbracoManagementClient.getClient();
      const response = await client.getTreeStaticFileAncestors({ descendantPath });
      return response;
    } catch (error) {
      console.error(`Error getting ancestors for static file path ${descendantPath}:`, error);
      return [];
    }
  }

  /**
   * Normalize static file items for snapshot testing using createSnapshotResult helper
   */
  static normalizeStaticFileItems(items: StaticFileItemResponseModel | StaticFileItemResponseModel[]) {
    // Create a mock result object that matches the structure expected by createSnapshotResult
    const mockResult = {
      content: [{
        type: "text" as const,
        text: JSON.stringify(Array.isArray(items) ? { items } : items)
      }]
    };

    return createSnapshotResult(mockResult);
  }

  /**
   * Verify file system structure - checks that items have required properties
   */
  static verifyFileSystemStructure(items: StaticFileItemResponseModel[]): boolean {
    if (!Array.isArray(items)) {
      return false;
    }

    return items.every(item => {
      // Check required properties
      if (!item.path || typeof item.path !== 'string') {
        return false;
      }

      if (!item.name || typeof item.name !== 'string') {
        return false;
      }

      if (typeof item.isFolder !== 'boolean') {
        return false;
      }

      // Check parent structure if present
      if (item.parent) {
        if (!item.parent.path || typeof item.parent.path !== 'string') {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Recursively find a static file/folder by name across the entire file system
   */
  static async findItemRecursively(
    name: string,
    currentPath?: string
  ): Promise<StaticFileItemResponseModel | undefined> {
    try {
      const client = UmbracoManagementClient.getClient();

      // If no current path provided, start from root
      if (!currentPath) {
        const rootResponse = await client.getTreeStaticFileRoot({});
        const rootMatch = this.findByName(rootResponse.items, name);
        if (rootMatch) {
          return rootMatch;
        }

        // Check children of root folders
        for (const item of rootResponse.items) {
          if (item.isFolder) {
            const childMatch = await this.findItemRecursively(name, item.path);
            if (childMatch) {
              return childMatch;
            }
          }
        }
        return undefined;
      }

      // Check children of the current path
      const childrenResponse = await client.getTreeStaticFileChildren({
        parentPath: currentPath,
      });

      // Check direct children
      const childMatch = this.findByName(childrenResponse.items, name);
      if (childMatch) {
        return childMatch;
      }

      // Recursively check folders
      for (const item of childrenResponse.items) {
        if (item.isFolder) {
          const deeperMatch = await this.findItemRecursively(name, item.path);
          if (deeperMatch) {
            return deeperMatch;
          }
        }
      }

      return undefined;
    } catch (error) {
      console.error(`Error finding static file ${name} recursively:`, error);
      return undefined;
    }
  }

  /**
   * Since StaticFile is read-only, this is a no-op cleanup method for consistency with other helpers
   */
  static async cleanup(name: string): Promise<void> {
    // StaticFile is read-only, no cleanup needed
    // This method exists for consistency with other test helpers
    console.log(`StaticFile cleanup called for ${name} - no action needed (read-only endpoint)`);
  }
}