import { UmbracoManagementClient } from "@umb-management-client";
import { DataTypeTestHelper } from "./data-type-test-helper.js";
import { DataTypeTreeItemResponseModel } from "@/umbraco-api/schemas/dataTypeTreeItemResponseModel.js";
import { CreateFolderRequestModel } from "@/umbraco-api/schemas/index.js";
import { postDataTypeFolderBody } from "@/umbraco-api/umbracoManagementAPI.zod.js";

export class DataTypeFolderBuilder {
  private model: Partial<CreateFolderRequestModel> = {};
  private createdItem: DataTypeTreeItemResponseModel | null = null;

  constructor(private name: string) {
    this.model.name = name;
  }

  withParent(parentId: string): this {
    this.model.parent = { id: parentId };
    return this;
  }

  withParentId(parentId: string): this {
    return this.withParent(parentId);
  }

  build(): Partial<CreateFolderRequestModel> {
    return this.model;
  }

  async create() {
    try {
      const client = UmbracoManagementClient.getClient();
      const validatedModel = postDataTypeFolderBody.parse(this.model);

      await client.postDataTypeFolder(validatedModel);

      // Find the created folder by name
      const name = this.name;
      const createdItem = await DataTypeTestHelper.findDataType(name);

      if (!createdItem) {
        throw new Error(
          `Failed to find created data type folder with name: ${name}`
        );
      }

      this.createdItem = createdItem;
      return this;
    } catch (error) {
      console.error("Error creating data type folder:", error);
      throw error;
    }
  }

  getId(): string {
    if (!this.createdItem) {
      throw new Error("No data type folder has been created yet");
    }
    return this.createdItem.id;
  }

  getItem(): DataTypeTreeItemResponseModel {
    if (!this.createdItem) {
      throw new Error("No data type folder has been created yet");
    }
    return this.createdItem;
  }
}
