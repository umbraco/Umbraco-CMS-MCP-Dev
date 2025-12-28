import { UmbracoManagementClient } from "@umb-management-client";
import {
  getTreeStylesheetRootResponse,
  getTreeStylesheetChildrenResponse,
  getStylesheetByPathResponse,
  getStylesheetFolderByPathResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";

export const DEFAULT_STYLESHEET_CONTENT = "/* Default stylesheet content */\nbody {\n  font-family: Arial, sans-serif;\n}";

export class StylesheetHelper {
  static async verifyStylesheet(path: string): Promise<boolean> {
    try {
      const client = UmbracoManagementClient.getClient();
      await client.getStylesheetByPath(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async verifyStylesheetFolder(path: string): Promise<boolean> {
    try {
      const client = UmbracoManagementClient.getClient();
      await client.getStylesheetFolderByPath(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async getStylesheet(path: string) {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getStylesheetByPath(path);
    return getStylesheetByPathResponse.parse(response);
  }

  static async getStylesheetFolder(path: string) {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getStylesheetFolderByPath(path);
    return getStylesheetFolderByPathResponse.parse(response);
  }

  static findByName(items: any[], name: string) {
    return items.find((item) => item.name === name);
  }

  static async findStylesheet(name: string): Promise<any | undefined> {
    try {
      const client = UmbracoManagementClient.getClient();

      // First check root level
      const rootResponse = await client.getTreeStylesheetRoot({});
      const parsedRoot = getTreeStylesheetRootResponse.parse(rootResponse);
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
              const childrenResponse = await client.getTreeStylesheetChildren({
                parentPath: item.path,
              });
              const parsedChildren = getTreeStylesheetChildrenResponse.parse(childrenResponse);
              
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
                `Error getting children for stylesheet ${item.path}:`,
                error
              );
            }
          }
        }
        return undefined;
      };

      return await checkChildren(parsedRoot.items);
    } catch (error) {
      console.error(`Error finding stylesheet ${name}:`, error);
      return undefined;
    }
  }

  static async findStylesheetItems(name: string) {
    const item = await this.findStylesheet(name);
    if (!item) {
      return [];
    }
    
    return [item];
  }

  static async findStylesheetFolders(name: string) {
    const item = await this.findStylesheet(name);
    if (!item || !item.isFolder) {
      return [];
    }
    
    return [item];
  }

  static async cleanup(name: string): Promise<void> {
    try {
      const client = UmbracoManagementClient.getClient();
      
      // Find the main item to cleanup
      const mainItem = await this.findStylesheet(name);
      if (!mainItem) {
        return; // Nothing to cleanup - this is normal and not an error
      }

      if (mainItem.isFolder) {
        // For folders, we need to delete all children first, then the folder
        await this.cleanupFolderRecursively(mainItem.path, client);
      } else {
        // For files, just delete directly
        try {
          await client.deleteStylesheetByPath(mainItem.path);
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
      const childrenResponse = await client.getTreeStylesheetChildren({
        parentPath: folderPath,
      });
      const parsedChildren = getTreeStylesheetChildrenResponse.parse(childrenResponse);

      // Delete all children first (depth-first cleanup)
      for (const child of parsedChildren.items) {
        try {
          if (child.isFolder) {
            // Recursively cleanup subfolders
            await this.cleanupFolderRecursively(child.path, client);
          } else {
            // Delete files directly
            await client.deleteStylesheetByPath(child.path);
          }
        } catch (error) {
          console.error(`Error cleaning up child ${child.path}:`, error);
        }
      }

      // Now delete the empty folder
      try {
        await client.deleteStylesheetFolderByPath(folderPath);
      } catch (error) {
        console.error(`Error cleaning up folder ${folderPath}:`, error);
      }
    } catch (error) {
      // If we can't get children, try to delete the folder anyway
      try {
        await client.deleteStylesheetFolderByPath(folderPath);
      } catch (deleteError) {
        console.error(`Error cleaning up folder ${folderPath}:`, deleteError);
      }
    }
  }

}