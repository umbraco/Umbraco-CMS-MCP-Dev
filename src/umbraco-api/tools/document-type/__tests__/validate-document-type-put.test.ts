import ValidateDocumentTypeTool from "../put/validate-document-type.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import {
  createMockRequestHandlerExtra,
  getResultText,
  normalizeErrorResponse,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCTYPE_NAME = "_Test ValidateDocumentType";

describe("validate-document-type", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
  });

  it("should validate a valid document type", async () => {
    const builder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .create();
    const model = builder.build();
    const result = await ValidateDocumentTypeTool.handler(
      {
        id: builder.getId(),
        data: model,
      } as any, createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
  });

  it("should handle invalid document type model", async () => {
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
    const result = await ValidateDocumentTypeTool.handler(
      {
        id: "00000000-0000-0000-0000-000000000000",
        data: invalidModel,
      } as any, createMockRequestHandlerExtra()
    );
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });
});
