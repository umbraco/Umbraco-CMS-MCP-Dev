import GetDataTypeSchemaTool, {
  dataTypeSchemaOutputSchema,
} from "../get/get-data-type-schema.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import { setUmbracoVersion } from "../../../runtime-context.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DATA_TYPE_NAME = "_Test DT Schema Legacy";

describe("get-data-type-schema (integration, legacy path on < 17.4)", () => {
  setupTestEnvironment();

  afterEach(async () => {
    setUmbracoVersion("17.4.0");
    await DataTypeTestHelper.cleanup(TEST_DATA_TYPE_NAME);
  });

  it("synthesizes the modern output shape from a real data type", async () => {
    const builder = await new DataTypeBuilder()
      .withName(TEST_DATA_TYPE_NAME)
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
});
