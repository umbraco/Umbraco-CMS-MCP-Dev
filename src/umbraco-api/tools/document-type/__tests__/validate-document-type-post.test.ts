import ValidateDocumentTypePostTool from "../post/validate-document-type.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import {
  createMockRequestHandlerExtra,
  getResultText,
  normalizeErrorResponse,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCTYPE_NAME = "_Test ValidateDocumentTypePost";

describe("validate-document-type-post", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test document types
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
  });

  it("should validate a valid document type (POST)", async () => {
    const model = new DocumentTypeBuilder().withName(TEST_DOCTYPE_NAME).build();
    const result = await ValidateDocumentTypePostTool.handler(model as any, createMockRequestHandlerExtra());
    expect(result).toMatchSnapshot();
  });

  it("should handle invalid document type model (POST)", async () => {
    // Invalid model: missing required fields
    const invalidModel = {
      name: "",
      alias: "",
      icon: "",
      allowedAsRoot: false,
      variesByCulture: false,
      variesBySegment: false,
      isElement: false,
      properties: [],
      containers: [],
      allowedTemplates: [],
      cleanup: { preventCleanup: false },
      allowedDocumentTypes: [],
      compositions: [],
    };
    const result = await ValidateDocumentTypePostTool.handler(invalidModel as any, createMockRequestHandlerExtra());
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });
});
