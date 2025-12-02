import { UmbracoManagementClient } from "@umb-management-client";
import { MemberTypeTreeItemResponseModel } from "@/umb-management-api/schemas/memberTypeTreeItemResponseModel.js";

export class MemberTypeTestHelper {
  static async verifyMemberType(id: string): Promise<boolean> {
    try {
      const client = UmbracoManagementClient.getClient();
      await client.getItemMemberType({ id: [id] });
      return true;
    } catch (error) {
      return false;
    }
  }

  static findByName(
    items: MemberTypeTreeItemResponseModel[],
    name: string
  ): MemberTypeTreeItemResponseModel | undefined {
    return items.find((item) => item.name === name);
  }

  static async findMemberTypes(name: string) {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMemberTypeRoot({ skip: 0, take: 100 });
    return response.items.filter(
      (item: { name: string }) => item.name === name
    );
  }

  static async findMemberType(
    name: string
  ): Promise<MemberTypeTreeItemResponseModel | undefined> {
    try {
      const client = UmbracoManagementClient.getClient();

      // Check root level - member types don't support hierarchical folders
      const rootResponse = await client.getTreeMemberTypeRoot({});
      const rootMatch = this.findByName(rootResponse.items, name);
      if (rootMatch) {
        return rootMatch;
      }

      return undefined;
    } catch (error) {
      console.error(`Error finding member type ${name}:`, error);
      return undefined;
    }
  }

  static async cleanup(name: string): Promise<void> {
    try {
      const item = await this.findMemberType(name);
      if (item) {
        const client = UmbracoManagementClient.getClient();
        try {
          // Check if item has a "container" flag to determine if it's a folder
          const isFolder = item.flags?.some(flag => flag.alias === "container");
          if (isFolder) {
            await client.deleteMemberTypeFolderById(item.id);
          } else {
            await client.deleteMemberTypeById(item.id);
          }
        } catch (deleteError) {
          console.error(
            `Error deleting member type ${item.id}:`,
            deleteError
          );
        }
      }
    } catch (error) {
      console.error(`Error cleaning up member type ${name}:`, error);
    }
  }

  static normaliseIds(item: any) {
    if (!item) return item;
    const result = { ...item };
    if (result.id) {
      result.id = "00000000-0000-0000-0000-000000000000";
    }
    if (result.parent?.id) {
      result.parent.id = "00000000-0000-0000-0000-000000000000";
    }
    return result;
  }
}
