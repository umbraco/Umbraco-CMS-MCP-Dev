import { jest } from "@jest/globals";
import GetDocumentTypeSchemaTool, {
  documentTypeSchemaOutputSchema,
} from "../get/get-document-type-schema.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { createMockRequestHandlerExtra } from "@umbraco-cms/mcp-server-sdk/testing";

// withErrorHandling logs caught errors via console.error; keep test output quiet.
async function withSilencedConsoleError<T>(fn: () => T | Promise<T>): Promise<T> {
  const spy = jest.spyOn(console, "error").mockImplementation(() => {});
  try {
    return await fn();
  } finally {
    spy.mockRestore();
  }
}

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

  it("returns an error result carrying the ProblemDetails when the id does not exist", async () => {
    const problemDetails = {
      type: "Error",
      title: "Not Found",
      status: 404,
      detail: "The specified document type was not found",
      operationStatus: "NotFound",
    };
    clientSpy.mockReturnValue({
      getDocumentTypeByIdSchema: jest.fn(async () => ({
        status: 404,
        statusText: "Not Found",
        data: problemDetails,
      })),
    } as any);

    const result: any = await withSilencedConsoleError(() =>
      GetDocumentTypeSchemaTool.handler(
        { id: DOC_TYPE_ID },
        createMockRequestHandlerExtra()
      )
    );

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toBeUndefined();
    expect(JSON.parse(result.content[0].text)).toEqual(problemDetails);
  });
});
