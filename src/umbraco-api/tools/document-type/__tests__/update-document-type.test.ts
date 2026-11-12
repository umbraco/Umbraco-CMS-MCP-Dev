import UpdateDocumentTypeTool from "../put/update-document-type.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  getResultText,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { TextString_DATA_TYPE_ID } from "../../../../constants/constants.js";

// The tool's own `data` input schema - strips response-only fields from a get-by-id echo
const updateDataSchema = UpdateDocumentTypeTool.inputSchema!.data;

describe("update-document-type", () => {
  const TEST_DOCTYPE_NAME = "_Test DocumentType Update";
  const UPDATED_DOCTYPE_NAME = "_Test DocumentType Updated";
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test document types
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
    await DocumentTypeTestHelper.cleanup(UPDATED_DOCTYPE_NAME);
  });

  it("should update a document type", async () => {
    // Create a document type to update
    const builder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .create();

    // Create update model using builder
    const updateModel = new DocumentTypeBuilder()
      .withName(UPDATED_DOCTYPE_NAME)
      .withDescription("Updated description")
      .withIcon("icon-updated")
      .allowAsRoot()
      .variesByCulture()
      .build();

    // Update the document type
    const result = await UpdateDocumentTypeTool.handler(
      {
        id: builder.getId(),
        data: updateModel,
      } as any, createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();

    // Verify the document type was updated
    const found = await DocumentTypeTestHelper.findDocumentType(
      UPDATED_DOCTYPE_NAME
    );
    expect(found).toBeDefined();
    expect(found!.id).toBe(builder.getId());
    expect(found!.name).toBe(UPDATED_DOCTYPE_NAME);
  });

  // Regression for #604: free-text body fields (the document type's own
  // description and a property description) must accept '?' and '&'.
  it("should accept '?' and '&' in descriptions when echoing get-by-id", async () => {
    const builder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withProperty("title", "Title", TextString_DATA_TYPE_ID)
      .create();

    const propertyDescription = "Leeg? Dan gebruiken we de paginanaam.";
    const docTypeDescription = "Pages for Joost & Co?";

    // Echo get-document-type-by-id, as in the issue's repro, through the
    // tool's own input schema (strips response-only fields).
    const existing = await DocumentTypeTestHelper.getFullDocumentType(builder.getId());
    const data = updateDataSchema.parse({
      ...existing,
      description: docTypeDescription,
      properties: existing.properties.map((p, i) =>
        i === 0 ? { ...p, description: propertyDescription } : p
      ),
    });

    const result = await UpdateDocumentTypeTool.handler(
      { id: builder.getId(), data } as any,
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBeFalsy();

    const updated = await DocumentTypeTestHelper.getFullDocumentType(builder.getId());
    expect(updated.description).toBe(docTypeDescription);
    expect(updated.properties[0].description).toBe(propertyDescription);
  });

  it("should still reject control characters in a property description", async () => {
    const builder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withProperty("title", "Title", TextString_DATA_TYPE_ID)
      .create();

    const existing = await DocumentTypeTestHelper.getFullDocumentType(builder.getId());
    const data = updateDataSchema.parse({
      ...existing,
      properties: existing.properties.map((p, i) =>
        i === 0 ? { ...p, description: "Bad\u0007value" } : p
      ),
    });

    const result = await UpdateDocumentTypeTool.handler(
      { id: builder.getId(), data } as any,
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
    expect(getResultText(result)).toContain("control characters");
  });

  it("should handle non-existent document type", async () => {
    const updateModel = new DocumentTypeBuilder()
      .withName(UPDATED_DOCTYPE_NAME)
      .withDescription("Updated description")
      .build();

    const result = await UpdateDocumentTypeTool.handler(
      {
        id: BLANK_UUID,
        data: updateModel,
      } as any, createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });

  it("should update document type with properties", async () => {
    // Create a document type to update
    const builder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .create();

    // Create update model with properties
    const updateModel = new DocumentTypeBuilder()
      .withName(UPDATED_DOCTYPE_NAME)
      .withDescription("Updated description")
      .withIcon("icon-updated")
      .allowAsRoot()
      .variesByCulture()
      // Add properties here if needed
      .build();

    // Update the document type
    const result = await UpdateDocumentTypeTool.handler(
      {
        id: builder.getId(),
        data: updateModel,
      } as any, createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();

    // Verify the document type was updated with properties
    const found = await DocumentTypeTestHelper.findDocumentType(
      UPDATED_DOCTYPE_NAME
    );
    expect(found).toBeDefined();
    expect(found!.id).toBe(builder.getId());
    expect(found!.name).toBe(UPDATED_DOCTYPE_NAME);
    // Add property verification if needed
  });
});
