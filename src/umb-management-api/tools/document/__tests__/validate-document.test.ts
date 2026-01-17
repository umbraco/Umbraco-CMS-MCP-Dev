import ValidateDocumentTool from "../post/validate-document.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import {
  createMockRequestHandlerExtra,
  normalizeErrorResponse,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCUMENT_NAME = "_Test ValidateDocument";

// Helper to build a valid validation model from a created document
async function buildValidationModel() {
  const builder = await new DocumentBuilder()
    .withName(TEST_DOCUMENT_NAME)
    .withRootDocumentType()
    .create();
  const item = builder.getCreatedItem();
  // Build a minimal valid model for validation
  return {
    values: [],
    variants: [
      {
        name: TEST_DOCUMENT_NAME,
        culture: null,
        segment: null,
      },
    ],
    id: item.id,
    parent: item.parent ? { id: item.parent.id } : undefined,
    documentType: item.documentType,
    template: null,
  };
}

describe("validate-document", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should validate a valid document", async () => {
    const model = await buildValidationModel();
    const result = await ValidateDocumentTool.handler(model, createMockRequestHandlerExtra());
    expect(result).toMatchSnapshot();
  });

  it("should handle invalid document model", async () => {
    // Invalid model: required fields are present but invalid
    const invalidModel = {
      values: [],
      variants: [{ name: "", culture: null, segment: null }],
      documentType: undefined,
      template: null,
    };
    const result = await ValidateDocumentTool.handler(invalidModel as any, createMockRequestHandlerExtra());
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });
});
