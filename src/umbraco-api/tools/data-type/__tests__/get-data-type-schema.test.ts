import { jest } from "@jest/globals";
import GetDataTypeSchemaTool, {
  dataTypeSchemaOutputSchema,
} from "../get/get-data-type-schema.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { createMockRequestHandlerExtra } from "@umbraco-cms/mcp-server-sdk/testing";

const DATA_TYPE_ID = "33333333-3333-3333-3333-333333333333";

describe("get-data-type-schema", () => {
  let clientSpy: jest.SpiedFunction<typeof UmbracoManagementClient.getClient>;

  beforeEach(() => {
    clientSpy = jest.spyOn(UmbracoManagementClient, "getClient");
  });

  afterEach(() => {
    clientSpy.mockRestore();
  });

  it("delegates to the Schema-API endpoint and returns its response", async () => {
    const fakeResponse = {
      valueTypeName: "STRING",
      jsonSchema: { type: "string" },
    };
    clientSpy.mockReturnValue({
      getDataTypeByIdSchema: jest.fn(async () => ({ data: fakeResponse })),
    } as any);

    const result: any = await GetDataTypeSchemaTool.handler(
      { id: DATA_TYPE_ID },
      createMockRequestHandlerExtra()
    );

    expect(result.structuredContent).toEqual(fakeResponse);
    expect(dataTypeSchemaOutputSchema.safeParse(result.structuredContent).success).toBe(true);
  });

  it("returns an empty object when the endpoint returns no body", async () => {
    clientSpy.mockReturnValue({
      getDataTypeByIdSchema: jest.fn(async () => ({ data: undefined })),
    } as any);

    const result: any = await GetDataTypeSchemaTool.handler(
      { id: DATA_TYPE_ID },
      createMockRequestHandlerExtra()
    );

    expect(result.structuredContent).toEqual({});
    expect(dataTypeSchemaOutputSchema.safeParse(result.structuredContent).success).toBe(true);
  });
});
