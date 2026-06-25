import { UmbracoManagementClient } from "@umb-management-client";
import { CreateElementRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  postElementBody,
  postDocumentTypeBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { v4 as uuidv4 } from "uuid";
import { ElementTestHelper } from "./element-test-helper.js";
import type { ElementTreeItemResponseModel } from "@/umb-management-api/schemas/elementTreeItemResponseModel.js";

/**
 * A fixed element document-type ID used across all element builder instances.
 * Created on first use and shared via ElementTypeRegistry.
 */
const ELEMENT_TYPE_NAME = "_Test Element Type (Builder)";
const ELEMENT_TYPE_ALIAS = "_TestElementTypeBuilder";

/**
 * Registry for the shared element type used by ElementBuilder.
 * Manages lifecycle of the element document type needed to create elements.
 */
export class ElementTypeRegistry {
  private static elementTypeId: string | null = null;

  static async getOrCreateElementTypeId(): Promise<string> {
    if (this.elementTypeId !== null) {
      return this.elementTypeId;
    }

    const client = UmbracoManagementClient.getClient();
    const id = uuidv4();

    const payload = postDocumentTypeBody.parse({
      id,
      name: ELEMENT_TYPE_NAME,
      alias: ELEMENT_TYPE_ALIAS,
      description: "Shared element type for integration tests",
      icon: "icon-document",
      isElement: true,
      allowedAsRoot: true,
      allowedInLibrary: true,
      variesByCulture: false,
      variesBySegment: false,
      allowedTemplates: [],
      allowedDocumentTypes: [],
      compositions: [],
      containers: [],
      properties: [],
      cleanup: { preventCleanup: false },
    });

    await client.postDocumentType(payload);
    this.elementTypeId = id;
    return id;
  }

  static async deleteElementType(): Promise<void> {
    if (this.elementTypeId === null) {
      return;
    }
    try {
      const client = UmbracoManagementClient.getClient();
      await client.deleteDocumentTypeById(this.elementTypeId);
    } catch (error) {
      console.log(`Error deleting element type ${this.elementTypeId}:`, error);
    } finally {
      this.elementTypeId = null;
    }
  }

  static reset(): void {
    this.elementTypeId = null;
  }
}

export class ElementBuilder {
  private model: Partial<CreateElementRequestModel> = {
    values: [],
    variants: [],
    parent: undefined,
  };

  private createdItem: ElementTreeItemResponseModel | null = null;

  withName(name: string): ElementBuilder {
    this.model.variants = [
      {
        culture: null,
        segment: null,
        name: name,
      },
    ];
    return this;
  }

  withParent(parentId: string): ElementBuilder {
    this.model.parent = { id: parentId };
    return this;
  }

  withDocumentType(documentTypeId: string): ElementBuilder {
    this.model.documentType = { id: documentTypeId };
    return this;
  }

  withValue(
    alias: string,
    value: unknown,
    culture: string | null = null,
    segment: string | null = null
  ): ElementBuilder {
    if (!this.model.values) this.model.values = [];
    this.model.values.push({ alias, value, culture, segment });
    return this;
  }

  build(): CreateElementRequestModel {
    return this.model as CreateElementRequestModel;
  }

  async create(): Promise<ElementBuilder> {
    const client = UmbracoManagementClient.getClient();

    // Ensure we have a document type; if none set, use the shared test element type
    if (!this.model.documentType) {
      const elementTypeId = await ElementTypeRegistry.getOrCreateElementTypeId();
      this.model.documentType = { id: elementTypeId };
    }

    const elementId = uuidv4();
    this.model.id = elementId;

    const validatedModel = postElementBody.parse(this.model);
    await client.postElement(validatedModel);

    // Find the created element by name
    const name = this.model.variants && this.model.variants[0]?.name;
    if (!name) {
      throw new Error("Element must have a name");
    }

    const found = await ElementTestHelper.findElement(name);
    if (!found) {
      throw new Error(`Failed to find created element with name: ${name}`);
    }

    this.createdItem = found;
    return this;
  }

  async moveToRecycleBin(): Promise<ElementBuilder> {
    if (!this.createdItem) {
      throw new Error(
        "No element has been created yet. Cannot move to recycle bin."
      );
    }
    const client = UmbracoManagementClient.getClient();
    await client.putElementByIdMoveToRecycleBin(this.createdItem.id);
    return this;
  }

  getId(): string {
    if (!this.createdItem) {
      throw new Error("No element has been created yet");
    }
    return this.createdItem.id;
  }

  getCreatedItem(): ElementTreeItemResponseModel {
    if (!this.createdItem) {
      throw new Error("No element has been created yet");
    }
    return this.createdItem;
  }
}
