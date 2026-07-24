import GetDataTypeSchemaTool, {
  dataTypeSchemaOutputSchema,
} from "../get/get-data-type-schema.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import { setUmbracoVersion } from "../../../runtime-context.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DATA_TYPE_NAME_LEGACY = "_Test DT Schema Legacy";
const TEST_DATA_TYPE_NAME_LIVE = "_Test DT Schema Live";

describe("get-data-type-schema (integration)", () => {
  setupTestEnvironment();
  let realVersion: string;

  beforeAll(async () => {
    const info = await UmbracoManagementClient.getClient().getServerInformation();
    realVersion = info.version;
  });

  afterEach(async () => {
    setUmbracoVersion("17.4.0");
    await DataTypeTestHelper.cleanup(TEST_DATA_TYPE_NAME_LEGACY);
    await DataTypeTestHelper.cleanup(TEST_DATA_TYPE_NAME_LIVE);
  });

  it("legacy path (forced < 17.4): synthesizes the modern output shape from a real data type", async () => {
    const builder = await new DataTypeBuilder()
      .withName(TEST_DATA_TYPE_NAME_LEGACY)
      .withTextbox()
      .create();

    setUmbracoVersion("17.3.0");

    const result: any = await GetDataTypeSchemaTool.handler(
      { id: builder.getId() },
      createMockRequestHandlerExtra()
    );

    const parsed = dataTypeSchemaOutputSchema.safeParse(result.structuredContent);
    expect(parsed.success).toBe(true);
    expect(result.structuredContent.valueTypeName).toBe("STRING");
    expect((result.structuredContent.jsonSchema as any).editorAlias).toBe("Umbraco.TextBox");
    expect((result.structuredContent.jsonSchema as any).example).toBe("some string");
  });

  it("live path (real server version): output parses against the shared zod", async () => {
    const builder = await new DataTypeBuilder()
      .withName(TEST_DATA_TYPE_NAME_LIVE)
      .withTextbox()
      .create();

    setUmbracoVersion(realVersion);

    const result: any = await GetDataTypeSchemaTool.handler(
      { id: builder.getId() },
      createMockRequestHandlerExtra()
    );

    expect(dataTypeSchemaOutputSchema.safeParse(result.structuredContent).success).toBe(true);
    expect(result.structuredContent.jsonSchema).toBeDefined();
    expect(result.structuredContent.jsonSchema).not.toBeNull();
  });
});
