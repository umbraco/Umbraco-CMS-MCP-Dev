import { UmbracoManagementClient } from "@umb-management-client";
import { ScriptItemResponseModel } from "@/umb-management-api/schemas/scriptItemResponseModel.js";
import { BLANK_UUID } from "@/constants/constants.js";

export class ScriptTestHelper {
  static findByName(
    items: ScriptItemResponseModel[],
    name: string
  ): ScriptItemResponseModel | undefined {
    return items.find((item) => item.name === name);
  }

  static normaliseIds(
    items:
      | ScriptItemResponseModel
      | ScriptItemResponseModel[]
  ): ScriptItemResponseModel | ScriptItemResponseModel[] {
    if (Array.isArray(items)) {
      return items.map((item) => ({ 
        ...item, 
        path: item.path.replace(/[a-f0-9-]{36}/gi, BLANK_UUID)
      }));
    }
    return { 
      ...items, 
      path: items.path.replace(/[a-f0-9-]{36}/gi, BLANK_UUID)
    };
  }

  static async cleanup(name: string): Promise<void> {
    try {
      const item = await this.findScript(name);
      if (item) {
        const client = UmbracoManagementClient.getClient();
        try {
          if (item.isFolder) {
            await client.deleteScriptFolderByPath(item.path);
          } else {
            await client.deleteScriptByPath(item.path);
          }
        } catch (deleteError) {
          console.error(
            `Error deleting script ${item.path}:`,
            deleteError
          );
        }
      }
    } catch (error) {
      console.error(`Error cleaning up script ${name}:`, error);
    }
  }

  static async findScript(
    name: string
  ): Promise<ScriptItemResponseModel | undefined> {
    try {
      const client = UmbracoManagementClient.getClient();

      // First check root level
      const rootResponse = await client.getTreeScriptRoot({});
      const rootMatch = this.findByName(rootResponse.items, name);
      if (rootMatch) {
        return rootMatch;
      }

      // Recursively check children
      async function checkChildren(items: ScriptItemResponseModel[]): Promise<ScriptItemResponseModel | undefined> {
        for (const item of items) {
          if (item.isFolder) {
            try {
              const childrenResponse = await client.getTreeScriptChildren({
                parentPath: item.path,
              });
              
              // Check these children
              const childMatch = ScriptTestHelper.findByName(childrenResponse.items, name);
              if (childMatch) {
                return childMatch;
              }

              // Recursively check their children
              const deeperMatch = await checkChildren(childrenResponse.items);
              if (deeperMatch) {
                return deeperMatch;
              }
            } catch (error) {
              console.error(
                `Error getting children for script ${item.path}:`,
                error
              );
            }
          }
        }
        return undefined;
      }

      return await checkChildren(rootResponse.items);
    } catch (error) {
      console.error(`Error finding script ${name}:`, error);
      return undefined;
    }
  }
}