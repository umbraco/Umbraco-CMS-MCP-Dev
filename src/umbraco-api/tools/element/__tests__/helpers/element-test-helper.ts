import { UmbracoManagementClient } from "@umb-management-client";
import type { ElementTreeItemResponseModel } from "@/umbraco-api/schemas/elementTreeItemResponseModel.js";
import type { ElementRecycleBinItemResponseModel } from "@/umbraco-api/schemas/elementRecycleBinItemResponseModel.js";
import type { ElementVariantItemResponseModel } from "@/umbraco-api/schemas/elementVariantItemResponseModel.js";

export class ElementTestHelper {
  private static findByName(
    items: ElementTreeItemResponseModel[],
    name: string
  ): ElementTreeItemResponseModel | undefined {
    return items.find(
      (item) =>
        !item.isFolder &&
        Array.isArray(item.variants) &&
        item.variants.some(
          (variant: ElementVariantItemResponseModel) => variant.name === name
        )
    );
  }

  static getNameFromItem(item?: ElementTreeItemResponseModel): string {
    if (item && item.variants && item.variants.length > 0) {
      return item.variants[0].name;
    }
    return "";
  }

  /**
   * Find an element by variant name, searching tree root and one level of children.
   */
  static async findElement(
    name: string
  ): Promise<ElementTreeItemResponseModel | undefined> {
    try {
      const client = UmbracoManagementClient.getClient();

      // First check root level
      const rootResponse = await client.getTreeElementRoot({});
      const rootMatch = this.findByName(rootResponse.items, name);
      if (rootMatch) {
        return rootMatch;
      }

      // Check children of any root items that have children
      for (const item of rootResponse.items) {
        if (item.hasChildren) {
          try {
            const childrenResponse = await client.getTreeElementChildren({
              parentId: item.id,
            });
            const childMatch = this.findByName(childrenResponse.items, name);
            if (childMatch) {
              return childMatch;
            }
          } catch (error) {
            console.log(
              `Error getting children for element ${item.id}:`,
              error
            );
          }
        }
      }

      return undefined;
    } catch (error) {
      console.log(`Error finding element with name '${name}':`, error);
      return undefined;
    }
  }

  private static findByNameInRecycleBin(
    items: ElementRecycleBinItemResponseModel[],
    name: string
  ): ElementRecycleBinItemResponseModel | undefined {
    return items.find(
      (item) =>
        !item.isFolder &&
        Array.isArray(item.variants) &&
        item.variants.some(
          (variant: ElementVariantItemResponseModel) => variant.name === name
        )
    );
  }

  /**
   * Find an element in the recycle bin by variant name.
   */
  static async findElementInRecycleBin(
    name: string
  ): Promise<ElementRecycleBinItemResponseModel | undefined> {
    try {
      const client = UmbracoManagementClient.getClient();

      const recycleBinResponse = await client.getRecycleBinElementRoot({});
      const match = this.findByNameInRecycleBin(recycleBinResponse.items, name);
      if (match) {
        return match;
      }

      for (const item of recycleBinResponse.items) {
        if (item.hasChildren) {
          try {
            const childrenResponse = await client.getRecycleBinElementChildren({
              parentId: item.id,
            });
            const childMatch = this.findByNameInRecycleBin(
              childrenResponse.items,
              name
            );
            if (childMatch) {
              return childMatch;
            }
          } catch (error) {
            console.log(
              `Error getting recycle bin children for element ${item.id}:`,
              error
            );
          }
        }
      }

      return undefined;
    } catch (error) {
      console.log(
        `Error finding element with name '${name}' in recycle bin:`,
        error
      );
      return undefined;
    }
  }

  /**
   * Delete an element by name. If not found in tree, attempts recycle bin then permanent delete.
   */
  static async cleanup(name: string): Promise<void> {
    try {
      const client = UmbracoManagementClient.getClient();

      // Try tree first
      const item = await this.findElement(name);
      if (item) {
        try {
          await client.deleteElementById(item.id);
        } catch (deleteError) {
          console.log(`Error deleting element ${item.id}:`, deleteError);
        }
        return;
      }

      // Try recycle bin
      const recycleBinItem = await this.findElementInRecycleBin(name);
      if (recycleBinItem) {
        try {
          await client.deleteRecycleBinElementById(
            recycleBinItem.id
          );
        } catch (deleteError) {
          console.log(
            `Error deleting element ${recycleBinItem.id} from recycle bin:`,
            deleteError
          );
        }
      }
    } catch (error) {
      console.log(`Error cleaning up element '${name}':`, error);
    }
  }

  /**
   * Empty the element recycle bin.
   */
  static async emptyRecycleBin(): Promise<void> {
    try {
      const client = UmbracoManagementClient.getClient();
      await client.deleteRecycleBinElement();
    } catch (error) {
      console.log("Error emptying element recycle bin:", error);
    }
  }

  /**
   * Get children of an element.
   */
  static async getChildren(
    parentId: string,
    take: number = 10
  ): Promise<ElementTreeItemResponseModel[]> {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeElementChildren({ parentId, take });
    return response.items;
  }
}
