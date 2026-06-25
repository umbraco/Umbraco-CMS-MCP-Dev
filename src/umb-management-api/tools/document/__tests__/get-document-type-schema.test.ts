import { jest } from "@jest/globals";
import GetDocumentTypeSchemaTool, {
  documentTypeSchemaOutputSchema,
} from "../get/get-document-type-schema.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { createMockRequestHandlerExtra } from "@umbraco-cms/mcp-server-sdk/testing";

const DOC_TYPE_ID = "11111111-1111-1111-1111-111111111111";

describe("get-document-type-schema", () => {
  let clientSpy: jest.SpiedFunction<typeof UmbracoManagementClient.getClient>;

  beforeEach(() => {
    clientSpy = jest.spyOn(UmbracoManagementClient, "getClient");
  });

  afterEach(() => {
    clientSpy.mockRestore();
  });

  it("delegates to the Schema-API endpoint and returns its response", async () => {
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
});
