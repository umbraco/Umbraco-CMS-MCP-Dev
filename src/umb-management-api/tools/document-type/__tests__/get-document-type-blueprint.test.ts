import GetDocumentTypeBlueprintTool from "../get/get-document-type-blueprint.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
// TODO: Document blueprint tests are skipped - document-blueprint module not in this template
// import { DocumentBlueprintBuilder } from "../../document-blueprint/__tests__/helpers/document-blueprint-builder.js";
// import { DocumentBlueprintTestHelper } from "../../document-blueprint/__tests__/helpers/document-blueprint-test-helper.js";
import { jest } from "@jest/globals";
import { createMockRequestHandlerExtra, getResultText } from "@/test-helpers/create-mock-request-handler-extra.js";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_DOCTYPE_NAME = "_Test DocumentType Blueprint";
const TEST_BLUEPRINT_NAME = "_Test Blueprint For DocumentType";

// Skipping: document-blueprint module not available in this template
describe.skip("get-document-type-blueprint", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    // Clean up any test document types and blueprints
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
    // await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_NAME);
  });

  it("should get blueprints for a document type", async () => {
    // Create a document type
    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .create();

    // Create a blueprint for the document type
    // await new DocumentBlueprintBuilder(TEST_BLUEPRINT_NAME)
    //   .withDocumentType(docTypeBuilder.getId())
    //   .create();

    // Get the blueprints
    const result = await GetDocumentTypeBlueprintTool.handler(
      {
        id: docTypeBuilder.getId(),
      } as any, createMockRequestHandlerExtra()
    );

    // Normalize IDs in the response
    const normalizedResult = {
      ...result,
      content: result.content.map((content) => {
        const parsed = JSON.parse((content as any).text);
        return {
          ...content,
          text: JSON.stringify({
            ...parsed,
            items: DocumentTypeTestHelper.normaliseIds(parsed.items),
          }),
        };
      }),
    };

    // Verify the handler response using snapshot
    expect(normalizedResult).toMatchSnapshot();
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
