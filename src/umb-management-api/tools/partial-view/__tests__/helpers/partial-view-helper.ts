import { UmbracoManagementClient } from "@umb-management-client";
import {
  getTreePartialViewRootResponse,
  getTreePartialViewChildrenResponse,
  getPartialViewByPathResponse,
  getPartialViewFolderByPathResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";

export const DEFAULT_PARTIAL_VIEW_CONTENT = "@* Default partial view content *@\n<p>Default content</p>";

export class PartialViewHelper {
  static async verifyPartialView(path: string): Promise<boolean> {
    try {
      const client = UmbracoManagementClient.getClient();
      await client.getPartialViewByPath(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async verifyPartialViewFolder(path: string): Promise<boolean> {
    try {
      const client = UmbracoManagementClient.getClient();
      await client.getPartialViewFolderByPath(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async getPartialView(path: string) {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getPartialViewByPath(path);
    return getPartialViewByPathResponse.parse(response);
  }

  static async getPartialViewFolder(path: string) {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getPartialViewFolderByPath(path);
    return getPartialViewFolderByPathResponse.parse(response);
  }

  static findByName(items: any[], name: string) {
    return items.find((item) => item.name === name);
  }

  static async findPartialView(name: string): Promise<any | undefined> {
    try {
      const client = UmbracoManagementClient.getClient();

      // First check root level
      const rootResponse = await client.getTreePartialViewRoot({});
      const parsedRoot = getTreePartialViewRootResponse.parse(rootResponse);
      const rootMatch = this.findByName(parsedRoot.items, name);
      if (rootMatch) {
        return rootMatch;
      }

      // Recursively check children
      const checkChildren = async (items: any[]): Promise<any | undefined> => {
        for (const item of items) {
          if (item.hasChildren) {
            try {
              // Use parentPath parameter
              const childrenResponse = await client.getTreePartialViewChildren({
                parentPath: item.path,
              });
              const parsedChildren = getTreePartialViewChildrenResponse.parse(childrenResponse);
              
              // Check these children
              const childMatch = this.findByName(parsedChildren.items, name);
              if (childMatch) {
                return childMatch;
              }

              // Recursively check their children
              const deeperMatch = await checkChildren(parsedChildren.items);
              if (deeperMatch) {
                return deeperMatch;
              }
            } catch (error) {
              console.error(
                `Error getting children for partial view ${item.path}:`,
                error
              );
            }
          }
        }
        return undefined;
      };

      return await checkChildren(parsedRoot.items);
    } catch (error) {
      console.error(`Error finding partial view ${name}:`, error);
      return undefined;
    }
  }

  static async findPartialViews(name: string) {
    const item = await this.findPartialView(name);
    if (!item) {
      return [];
    }
    
    return [item];
  }

  static async findPartialViewFolders(name: string) {
    const item = await this.findPartialView(name);
    if (!item || !item.isFolder) {
      return [];
    }
    
    return [item];
  }

  static async cleanup(name: string): Promise<void> {
    try {
      const client = UmbracoManagementClient.getClient();
      
      // Find the main item to cleanup
      const mainItem = await this.findPartialView(name);
      if (!mainItem) {
        return; // Nothing to cleanup - this is normal and not an error
      }

      if (mainItem.isFolder) {
        // For folders, we need to delete all children first, then the folder
        await this.cleanupFolderRecursively(mainItem.path, client);
      } else {
        // For files, just delete directly
        try {
          await client.deletePartialViewByPath(mainItem.path);
        } catch (error) {
          // Ignore deletion errors during cleanup
        }
      }
    } catch (error) {
      // Ignore all cleanup errors - same pattern as other entity helpers
    }
  }

  private static async cleanupFolderRecursively(folderPath: string, client: any): Promise<void> {
    try {
      // Get all children of this folder
      const childrenResponse = await client.getTreePartialViewChildren({
        parentPath: folderPath,
      });
      const parsedChildren = getTreePartialViewChildrenResponse.parse(childrenResponse);

      // Delete all children first (depth-first cleanup)
      for (const child of parsedChildren.items) {
        try {
          if (child.isFolder) {
            // Recursively cleanup subfolders
            await this.cleanupFolderRecursively(child.path, client);
          } else {
            // Delete files directly
            await client.deletePartialViewByPath(child.path);
          }
        } catch (error) {
          console.error(`Error cleaning up child ${child.path}:`, error);
        }
      }

      // Now delete the empty folder
      try {
        await client.deletePartialViewFolderByPath(folderPath);
      } catch (error) {
        console.error(`Error cleaning up folder ${folderPath}:`, error);
      }
    } catch (error) {
      // If we can't get children, try to delete the folder anyway
      try {
        await client.deletePartialViewFolderByPath(folderPath);
      } catch (deleteError) {
        console.error(`Error cleaning up folder ${folderPath}:`, deleteError);
      }
    }
  }

}