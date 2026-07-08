import GetDocumentTypeSchemaTool, {
  documentTypeSchemaOutputSchema,
} from "../get/get-document-type-schema.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DataTypeBuilder } from "../../data-type/__tests__/helpers/data-type-builder.js";
import { DataTypeTestHelper } from "../../data-type/__tests__/helpers/data-type-test-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOC_TYPE_NAME_LIVE = "_Test DocType Schema Live";
const TEST_DATA_TYPE_NAME_LIVE = "_Test DT For DocType Schema Live";

describe("get-document-type-schema (integration)", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_NAME_LIVE);
    await DataTypeTestHelper.cleanup(TEST_DATA_TYPE_NAME_LIVE);
  });

  it("output parses against the shared zod", async () => {
    const dataTypeBuilder = await new DataTypeBuilder()
      .withName(TEST_DATA_TYPE_NAME_LIVE)
      .withTextbox()
      .create();

    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOC_TYPE_NAME_LIVE)
      .withAlias("testDocTypeSchemaLive")
      .withProperty("title", "Title", dataTypeBuilder.getId())
      .create();

    const result: any = await GetDocumentTypeSchemaTool.handler(
      { id: docTypeBuilder.getId() },
      createMockRequestHandlerExtra()
    );

    expect(documentTypeSchemaOutputSchema.safeParse(result.structuredContent).success).toBe(true);
    expect(result.structuredContent.schema).toBeDefined();
    expect(result.structuredContent.schema).not.toBeNull();
  });
});
