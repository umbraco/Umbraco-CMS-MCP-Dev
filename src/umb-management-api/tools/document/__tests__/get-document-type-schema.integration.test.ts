import GetDocumentTypeSchemaTool, {
  documentTypeSchemaOutputSchema,
} from "../get/get-document-type-schema.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DataTypeBuilder } from "../../data-type/__tests__/helpers/data-type-builder.js";
import { DataTypeTestHelper } from "../../data-type/__tests__/helpers/data-type-test-helper.js";
import { setUmbracoVersion } from "../../../runtime-context.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOC_TYPE_NAME = "_Test DocType Schema Legacy";
const TEST_DATA_TYPE_NAME = "_Test DT For DocType Schema Legacy";

describe("get-document-type-schema (integration, legacy path on < 17.4)", () => {
  setupTestEnvironment();

  afterEach(async () => {
    setUmbracoVersion("17.4.0");
    await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_NAME);
    await DataTypeTestHelper.cleanup(TEST_DATA_TYPE_NAME);
  });

  it("synthesizes the modern output shape from a real document type with one property", async () => {
    const dataTypeBuilder = await new DataTypeBuilder()
      .withName(TEST_DATA_TYPE_NAME)
      .withTextbox()
      .create();

    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOC_TYPE_NAME)
      .withAlias("testDocTypeSchemaLegacy")
      .withProperty("title", "Title", dataTypeBuilder.getId())
      .create();

    setUmbracoVersion("17.3.0");

    const result: any = await GetDocumentTypeSchemaTool.handler(
      { id: docTypeBuilder.getId() },
      createMockRequestHandlerExtra()
    );

    const parsed = documentTypeSchemaOutputSchema.safeParse(result.structuredContent);
    expect(parsed.success).toBe(true);
    const schema = result.structuredContent.schema as any;
    expect(schema.title).toBe(TEST_DOC_TYPE_NAME);
    expect(schema.properties.title.editorAlias).toBe("Umbraco.TextBox");
    expect(schema.properties.title.example).toBe("some string");
  });
});
