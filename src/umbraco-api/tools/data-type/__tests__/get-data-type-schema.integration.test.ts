import GetDataTypeSchemaTool, {
  dataTypeSchemaOutputSchema,
} from "../get/get-data-type-schema.js";
import { DataTypeBuilder } from "./helpers/data-type-builder.js";
import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DATA_TYPE_NAME_LIVE = "_Test DT Schema Live";

describe("get-data-type-schema (integration)", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DataTypeTestHelper.cleanup(TEST_DATA_TYPE_NAME_LIVE);
  });

  it("output parses against the shared zod", async () => {
    const builder = await new DataTypeBuilder()
      .withName(TEST_DATA_TYPE_NAME_LIVE)
      .withTextbox()
      .create();

    const result: any = await GetDataTypeSchemaTool.handler(
      { id: builder.getId() },
      createMockRequestHandlerExtra()
    );

    expect(dataTypeSchemaOutputSchema.safeParse(result.structuredContent).success).toBe(true);
    expect(result.structuredContent.jsonSchema).toBeDefined();
    expect(result.structuredContent.jsonSchema).not.toBeNull();
  });
});
