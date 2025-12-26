import { UmbracoManagementClient } from "@umb-management-client";
import { DocumentBlueprintTreeItemResponseModel } from "@/umb-management-api/schemas/index.js";
import { BLANK_UUID } from "@/constants/constants.js";

export class DocumentBlueprintTestHelper {
  private static findByName(
    items: DocumentBlueprintTreeItemResponseModel[],
    name: string
  ): DocumentBlueprintTreeItemResponseModel | undefined {
    return items.find((item: any) => item.name === name);
  }

  static normaliseIds(
    items:
      | DocumentBlueprintTreeItemResponseModel
      | DocumentBlueprintTreeItemResponseModel[]
  ):
    | DocumentBlueprintTreeItemResponseModel
    | DocumentBlueprintTreeItemResponseModel[] {
    if (Array.isArray(items)) {
      return items.map((item) => ({
        ...item,
        id: BLANK_UUID,
        parent: item.parent ? { ...item.parent, id: BLANK_UUID } : item.parent
      }));
    }
    return {
      ...items,
      id: BLANK_UUID,
      parent: items.parent ? { ...items.parent, id: BLANK_UUID } : items.parent
    };
  }

  static async cleanup(name: string): Promise<void> {
    try {
      const client = UmbracoManagementClient.getClient();
      const item = await this.findDocumentBlueprint(name);

      if (item) {
        try {
          if (item.isFolder && item.hasChildren) {
            // Delete children first
            const childrenResponse = await client.getTreeDocumentBlueprintChildren({
              parentId: item.id,
            });
            for (const child of childrenResponse.items) {
              await this.cleanup(child.name);
            }
          }

          if (item.isFolder) {
            await client.deleteDocumentBlueprintFolderById(item.id);
          } else {
            await client.deleteDocumentBlueprintById(item.id);
          }
        } catch (deleteError) {
          console.log(`Error deleting blueprint ${item.id}:`, deleteError);
        }
      }
    } catch (error) {
      console.log(`Error cleaning up document blueprint '${name}':`, error);
    }
  }

  static async findDocumentBlueprint(
    name: string
  ): Promise<DocumentBlueprintTreeItemResponseModel | undefined> {
    try {
      const client = UmbracoManagementClient.getClient();

      // First check root level
      const rootResponse = await client.getTreeDocumentBlueprintRoot({});
      const rootMatch = this.findByName(rootResponse.items, name);
      if (rootMatch) {
        return rootMatch;
      }

      // Only check children if we haven't found the blueprint
      for (const item of rootResponse.items) {
        if (item.hasChildren) {
          try {
            const childrenResponse =
              await client.getTreeDocumentBlueprintChildren({
                parentId: item.id,
              });
            const childMatch = this.findByName(childrenResponse.items, name);
            if (childMatch) {
              return childMatch;
            }
          } catch (error) {
            console.log(
              `Error getting children for blueprint ${item.id}:`,
              error
            );
          }
        }
      }

      return undefined;
    } catch (error) {
      console.log(
        `Error finding document blueprints with name '${name}':`,
        error
      );
      return undefined;
    }
  }
}
