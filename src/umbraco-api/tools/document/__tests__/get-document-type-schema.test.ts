import { jest } from "@jest/globals";
import GetDocumentTypeSchemaTool, {
  documentTypeSchemaOutputSchema,
} from "../get/get-document-type-schema.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { setUmbracoVersion } from "../../../runtime-context.js";
import { createMockRequestHandlerExtra } from "@umbraco-cms/mcp-server-sdk/testing";

const DOC_TYPE_ID = "11111111-1111-1111-1111-111111111111";

describe("get-document-type-schema (wrapper)", () => {
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
    const fakeSchema = { "/document-type/x": { root: { type: "object" } } };
    clientSpy.mockReturnValue({
      getDocumentTypeByIdSchema: jest.fn(async () => ({ data: fakeSchema })),
    } as any);

    const result: any = await GetDocumentTypeSchemaTool.handler(
      { id: DOC_TYPE_ID },
      createMockRequestHandlerExtra()
    );

    expect(result.structuredContent).toEqual({ schema: fakeSchema });
    expect(documentTypeSchemaOutputSchema.safeParse(result.structuredContent).success).toBe(true);
  });

  it("on <17.4 synthesizes a schema by walking document type properties", async () => {
    setUmbracoVersion("17.3.0");

    const docType = {
      id: DOC_TYPE_ID,
      alias: "blogPost",
      name: "Blog Post",
      description: null,
      properties: [
        {
          alias: "title",
          name: "Title",
          description: null,
          dataType: { id: "22222222-2222-2222-2222-222222222222" },
        },
      ],
    };
    const dataType = {
      id: "22222222-2222-2222-2222-222222222222",
      name: "Textbox",
      editorAlias: "Umbraco.TextBox",
      editorUiAlias: "Umb.PropertyEditorUi.TextBox",
    };

    clientSpy.mockReturnValue({
      getDocumentTypeById: jest.fn(async () => docType),
      getDataTypeById: jest.fn(async () => dataType),
    } as any);

    const result: any = await GetDocumentTypeSchemaTool.handler(
      { id: DOC_TYPE_ID },
      createMockRequestHandlerExtra()
    );

    expect(documentTypeSchemaOutputSchema.safeParse(result.structuredContent).success).toBe(true);
    const synthesized = result.structuredContent.schema as any;
    expect(synthesized.title).toBe("Blog Post");
    expect(synthesized.properties.title.editorAlias).toBe("Umbraco.TextBox");
    expect(synthesized.properties.title.example).toBe("some string");
  });
});
