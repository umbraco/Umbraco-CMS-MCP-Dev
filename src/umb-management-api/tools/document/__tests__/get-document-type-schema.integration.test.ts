import GetDocumentTypeSchemaTool, {
  documentTypeSchemaOutputSchema,
} from "../get/get-document-type-schema.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DataTypeBuilder } from "../../data-type/__tests__/helpers/data-type-builder.js";
import { DataTypeTestHelper } from "../../data-type/__tests__/helpers/data-type-test-helper.js";
import { setUmbracoVersion } from "../../../runtime-context.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOC_TYPE_NAME_LEGACY = "_Test DocType Schema Legacy";
const TEST_DATA_TYPE_NAME_LEGACY = "_Test DT For DocType Schema Legacy";
const TEST_DOC_TYPE_NAME_LIVE = "_Test DocType Schema Live";
const TEST_DATA_TYPE_NAME_LIVE = "_Test DT For DocType Schema Live";

describe("get-document-type-schema (integration)", () => {
  setupTestEnvironment();
  let realVersion: string;

  beforeAll(async () => {
    const info = await UmbracoManagementClient.getClient().getServerInformation();
    realVersion = info.version;
  });

  afterEach(async () => {
    setUmbracoVersion("17.4.0");
    await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_NAME_LEGACY);
    await DocumentTypeTestHelper.cleanup(TEST_DOC_TYPE_NAME_LIVE);
    await DataTypeTestHelper.cleanup(TEST_DATA_TYPE_NAME_LEGACY);
    await DataTypeTestHelper.cleanup(TEST_DATA_TYPE_NAME_LIVE);
  });

  it("legacy path (forced < 17.4): synthesizes the modern output shape from a real document type", async () => {
    const dataTypeBuilder = await new DataTypeBuilder()
      .withName(TEST_DATA_TYPE_NAME_LEGACY)
      .withTextbox()
      .create();

    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOC_TYPE_NAME_LEGACY)
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
    expect(schema.title).toBe(TEST_DOC_TYPE_NAME_LEGACY);
    expect(schema.properties.title.editorAlias).toBe("Umbraco.TextBox");
    expect(schema.properties.title.example).toBe("some string");
  });

  it("live path (real server version): output parses against the shared zod", async () => {
    const dataTypeBuilder = await new DataTypeBuilder()
      .withName(TEST_DATA_TYPE_NAME_LIVE)
      .withTextbox()
      .create();

    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOC_TYPE_NAME_LIVE)
      .withAlias("testDocTypeSchemaLive")
      .withProperty("title", "Title", dataTypeBuilder.getId())
      .create();

    setUmbracoVersion(realVersion);

    const result: any = await GetDocumentTypeSchemaTool.handler(
      { id: docTypeBuilder.getId() },
      createMockRequestHandlerExtra()
    );

    expect(documentTypeSchemaOutputSchema.safeParse(result.structuredContent).success).toBe(true);
    expect(result.structuredContent.schema).toBeDefined();
    expect(result.structuredContent.schema).not.toBeNull();
  });
});
