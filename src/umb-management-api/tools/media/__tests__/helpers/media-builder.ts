import { UmbracoManagementClient } from "@umb-management-client";
import {
  CreateMediaRequestModel,
  PagedMediaTreeItemResponseModel,
} from "@/umb-management-api/schemas/index.js";
import { postMediaBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { MediaTestHelper } from "./media-test-helper.js";
import { v4 as uuidv4 } from "uuid";
import {
  FOLDER_MEDIA_TYPE_ID,
  IMAGE_MEDIA_TYPE_ID,
} from "@umbraco-cms/mcp-server-sdk";

export class MediaBuilder {
  private model: Partial<CreateMediaRequestModel> = {
    values: [],
    variants: [],
    parent: null,
    // mediaType is not set by default
  };

  private createdItem: any = null;

  withName(name: string): MediaBuilder {
    this.model.variants = [
      {
        culture: null,
        segment: null,
        name: name,
      },
    ];
    return this;
  }

  withParent(parentId: string): MediaBuilder {
    this.model.parent = { id: parentId };
    return this;
  }

  withImageMediaType(): MediaBuilder {
    this.model.mediaType = { id: IMAGE_MEDIA_TYPE_ID };
    return this;
  }

  withFolderMediaType(): MediaBuilder {
    this.model.mediaType = { id: FOLDER_MEDIA_TYPE_ID };
    return this;
  }

  withImageValue(temporaryFileId: string): MediaBuilder {
    this.model.values = [
      {
        alias: "umbracoFile",
        editorAlias: "Umbraco.ImageCropper",
        entityType: "media-property-value",
        value: {
          crops: [],
          culture: null,
          segment: null,
          focalPoint: {
            top: 0.5,
            right: 0.5,
          },
          temporaryFileId: temporaryFileId,
        },
      },
    ] as any; 
    return this;
  }

  withVariant(
    name: string,
    culture: string | null = null,
    segment: string | null = null
  ): MediaBuilder {
    if (!this.model.variants) this.model.variants = [];
    this.model.variants.push({ name, culture, segment });
    return this;
  }

  build(): CreateMediaRequestModel {
    return this.model as CreateMediaRequestModel;
  }

  async create(): Promise<MediaBuilder> {
    const client = UmbracoManagementClient.getClient();
    const validatedModel = postMediaBody.parse(this.model);
    await client.postMedia(validatedModel);
    // Find the created media by name
    const name = this.model.variants && this.model.variants[0]?.name;
    if (!name) {
      throw new Error("Media must have a name");
    }

    this.createdItem = await MediaTestHelper.findMedia(name);

    if (!this.createdItem) {
      throw new Error(`Failed to find created media with name: ${name}`);
    }
    return this;
  }

  async moveToRecycleBin(): Promise<MediaBuilder> {
    if (!this.createdItem) {
      throw new Error(
        "No media has been created yet. Cannot move to recycle bin."
      );
    }
    const client = UmbracoManagementClient.getClient();
    await client.putMediaByIdMoveToRecycleBin(this.createdItem.id);
    return this;
  }

  getId(): string {
    if (!this.createdItem) {
      throw new Error("No media has been created yet");
    }
    return this.createdItem.id;
  }

  getCreatedItem(): any {
    if (!this.createdItem) {
      throw new Error("No media has been created yet");
    }
    return this.createdItem;
  }

  async getChildren(): Promise<PagedMediaTreeItemResponseModel> {
    if (!this.createdItem) {
      throw new Error("No media has been created yet");
    }
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeMediaChildren({
      parentId: this.createdItem.id,
    });
    return response;
  }

  async updateName(newName: string): Promise<MediaBuilder> {
    if (!this.createdItem) {
      throw new Error("No media has been created yet");
    }
    const client = UmbracoManagementClient.getClient();

    this.createdItem.variants[0].name = newName;

    await client.putMediaById(this.createdItem.id, {
      values: this.createdItem.values,
      variants: this.createdItem.variants,
    });

    return this;
  }
}
