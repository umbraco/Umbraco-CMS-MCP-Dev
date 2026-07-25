import GetDocumentTypeBlueprintTool from "../get/get-document-type-blueprint.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import { DocumentBlueprintBuilder } from "../../document-blueprint/__tests__/helpers/document-blueprint-builder.js";
import { DocumentBlueprintTestHelper } from "../../document-blueprint/__tests__/helpers/document-blueprint-test-helper.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  normalizeObject,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCTYPE_NAME = "_Test DocumentType Blueprint";
const TEST_BLUEPRINT_NAME = "_Test Blueprint For DocumentType";

describe("get-document-type-blueprint", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test document types and blueprints
    await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
  });

  it("should get blueprints for a document type", async () => {
    // Create a document type
    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .create();

    // Create a blueprint for the document type
    await new DocumentBlueprintBuilder(TEST_BLUEPRINT_NAME)
      .withDocumentType(docTypeBuilder.getId())
      .create();

    // Get the blueprints
    const result = await GetDocumentTypeBlueprintTool.handler(
      {
        id: docTypeBuilder.getId(),
      } as any, createMockRequestHandlerExtra()
    );

    // Normalize and verify the handler response using snapshot
    expect(normalizeObject(result)).toMatchSnapshot();
  });

  it("should handle non-existent document type", async () => {
    const result = await GetDocumentTypeBlueprintTool.handler(
      {
        id: BLANK_UUID,
      } as any, createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });

  it("should handle document type with no blueprints", async () => {
    // Create a document type without any blueprints
    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .create();

    // Get the blueprints
    const result = await GetDocumentTypeBlueprintTool.handler(
      {
        id: docTypeBuilder.getId(),
      } as any, createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });
});
