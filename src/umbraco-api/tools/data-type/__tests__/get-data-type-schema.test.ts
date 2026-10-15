import { jest } from "@jest/globals";
import GetDataTypeSchemaTool, {
  dataTypeSchemaOutputSchema,
} from "../get/get-data-type-schema.js";
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

  it("returns an error result carrying the ProblemDetails when the id does not exist", async () => {
    const problemDetails = {
      type: "Error",
      title: "Not Found",
      status: 404,
      detail: "The specified data type was not found",
      operationStatus: "NotFound",
    };
    clientSpy.mockReturnValue({
      getDataTypeByIdSchema: jest.fn(async () => ({
        status: 404,
        statusText: "Not Found",
        data: problemDetails,
      })),
    } as any);

    const result: any = await withSilencedConsoleError(() =>
      GetDataTypeSchemaTool.handler(
        { id: DATA_TYPE_ID },
        createMockRequestHandlerExtra()
      )
    );

    expect(result.isError).toBe(true);
    expect(result.structuredContent).toBeUndefined();
    expect(JSON.parse(result.content[0].text)).toEqual(problemDetails);
  });
});
