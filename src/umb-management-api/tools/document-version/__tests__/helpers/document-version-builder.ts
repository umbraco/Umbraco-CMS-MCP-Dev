import { UmbracoManagementClient } from "@umb-management-client";
import { CreateDocumentRequestModel } from "@/umb-management-api/schemas/index.js";
import { postDocumentBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CONTENT_DOCUMENT_TYPE_ID, ROOT_DOCUMENT_TYPE_ID } from "@/constants/constants.js";
import { DocumentTestHelper } from "../../../document/__tests__/helpers/document-test-helper.js";

export class DocumentVersionBuilder {
  private model: Partial<CreateDocumentRequestModel> = {
    values: [],
    variants: [],
    parent: null,
    template: null,
    // documentType is not set by default
  };

  private createdItem: any = null;
  private culture: string | null = null;

  withName(name: string): DocumentVersionBuilder {
    // Use existing culture if set, otherwise null
    this.model.variants = [
      {
        culture: this.culture,
        segment: null,
        name: name,
      },
    ];
    return this;
  }

  withCulture(culture: string): DocumentVersionBuilder {
    this.culture = culture;
    // Update existing variants if any
    if (this.model.variants && this.model.variants.length > 0) {
      this.model.variants = this.model.variants.map(v => ({
        ...v,
        culture: culture,
      }));
    }
    return this;
  }

  withParent(parentId: string): DocumentVersionBuilder {
    this.model.parent = { id: parentId };
    return this;
  }

  withDocumentType(documentTypeId: string): DocumentVersionBuilder {
    this.model.documentType = { id: documentTypeId };
    return this;
  }

  withRootDocumentType(): DocumentVersionBuilder {
    this.model.documentType = { id: ROOT_DOCUMENT_TYPE_ID };
    return this;
  }

  withContentDocumentType(): DocumentVersionBuilder {
    this.model.documentType = { id: CONTENT_DOCUMENT_TYPE_ID };
    return this;
  }

  withValue(
    alias: string,
    value: any,
    culture: string | null = null,
    segment: string | null = null
  ): DocumentVersionBuilder {
    if (!this.model.values) this.model.values = [];
    this.model.values.push({ alias, value, culture, segment });
    return this;
  }

  build(): CreateDocumentRequestModel {
    return this.model as CreateDocumentRequestModel;
  }

  async create(): Promise<DocumentVersionBuilder> {
    const client = UmbracoManagementClient.getClient();
    const validatedModel = postDocumentBody.parse(this.model);
    await client.postDocument(validatedModel);

    // Find the created document by name
    const name = this.model.variants && this.model.variants[0]?.name;
    if (!name) {
      throw new Error("Document must have a name");
    }

    this.createdItem = await DocumentTestHelper.findDocument(name);

    if (!this.createdItem) {
      throw new Error(`Failed to find created document with name: ${name}`);
    }
    return this;
  }

  async publish(): Promise<DocumentVersionBuilder> {
    if (!this.createdItem) {
      throw new Error("No document has been created yet. Cannot publish.");
    }
    const client = UmbracoManagementClient.getClient();
    await client.putDocumentByIdPublish(this.createdItem.id, {
      publishSchedules: [{ culture: this.culture }],
    });
    return this;
  }

  async updateContent(): Promise<DocumentVersionBuilder> {
    if (!this.createdItem) {
      throw new Error("No document has been created yet. Cannot update.");
    }
    const client = UmbracoManagementClient.getClient();
    
    // Update the document to create a new version
    await client.putDocumentById(this.createdItem.id, {
      template: this.createdItem.template,
      values: this.createdItem.values || [],
      variants: this.createdItem.variants || [],
    });
    return this;
  }

  getId(): string {
    if (!this.createdItem) {
      throw new Error("No document has been created yet");
    }
    return this.createdItem.id;
  }

  getItem(): any {
    if (!this.createdItem) {
      throw new Error("No document has been created yet");
    }
    return this.createdItem;
  }

  async cleanup(): Promise<void> {
    if (this.createdItem) {
      try {
        const client = UmbracoManagementClient.getClient();
        await client.deleteDocumentById(this.createdItem.id);
      } catch (error) {
        console.error("Error cleaning up document:", error);
      }
    }
  }
}