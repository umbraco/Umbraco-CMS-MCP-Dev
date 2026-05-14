import { jest } from "@jest/globals";
import GetDataTypeSchemaTool, {
  dataTypeSchemaOutputSchema,
} from "../get/get-data-type-schema.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { setUmbracoVersion } from "../../../runtime-context.js";
import { createMockRequestHandlerExtra } from "@umbraco-cms/mcp-server-sdk/testing";

const DATA_TYPE_ID = "33333333-3333-3333-3333-333333333333";

describe("get-data-type-schema (wrapper)", () => {
  let clientSpy: jest.SpiedFunction<typeof UmbracoManagementClient.getClient>;

  beforeEach(() => {
    clientSpy = jest.spyOn(UmbracoManagementClient, "getClient");
  });

  afterEach(() => {
    clientSpy.mockRestore();
    setUmbracoVersion("17.4.0");
  });

  it("on 17.4+ delegates to the Schema-API endpoint and returns its response", async () => {
    setUmbracoVersion("17.4.0");
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

  it("on <17.4 synthesizes a schema from the data type's editor alias", async () => {
    setUmbracoVersion("17.3.0");

    const dataType = {
      id: DATA_TYPE_ID,
      name: "Article body",
      editorAlias: "Umbraco.TextBox",
      editorUiAlias: "Umb.PropertyEditorUi.TextBox",
    };
    clientSpy.mockReturnValue({
      getDataTypeById: jest.fn(async () => dataType),
    } as any);

    const result: any = await GetDataTypeSchemaTool.handler(
      { id: DATA_TYPE_ID },
      createMockRequestHandlerExtra()
    );

    expect(dataTypeSchemaOutputSchema.safeParse(result.structuredContent).success).toBe(true);
    expect(result.structuredContent.valueTypeName).toBe("STRING");
    const synthesized = result.structuredContent.jsonSchema as any;
    expect(synthesized.editorAlias).toBe("Umbraco.TextBox");
    expect(synthesized.example).toBe("some string");
  });

  it("on <17.4 with an unknown editor alias returns valueTypeName=null and no example", async () => {
    setUmbracoVersion("17.3.0");

    const dataType = {
      id: DATA_TYPE_ID,
      name: "Custom editor",
      editorAlias: "Some.Unknown.Editor",
      editorUiAlias: "Umb.PropertyEditorUi.Unknown",
    };
    clientSpy.mockReturnValue({
      getDataTypeById: jest.fn(async () => dataType),
    } as any);

    const result: any = await GetDataTypeSchemaTool.handler(
      { id: DATA_TYPE_ID },
      createMockRequestHandlerExtra()
    );

    expect(dataTypeSchemaOutputSchema.safeParse(result.structuredContent).success).toBe(true);
    expect(result.structuredContent.valueTypeName).toBeNull();
    expect((result.structuredContent.jsonSchema as any).example).toBeUndefined();
  });
});
