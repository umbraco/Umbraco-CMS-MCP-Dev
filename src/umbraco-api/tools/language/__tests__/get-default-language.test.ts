import GetDefaultLanguageTool from "../get/get-default-language.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-default-language", () => {
  setupTestEnvironment();

  let originalGetClient: typeof UmbracoManagementClient.getClient;

  beforeEach(() => {
    originalGetClient = UmbracoManagementClient.getClient;
  });

  afterEach(() => {
    UmbracoManagementClient.getClient = originalGetClient;
  });

  it("should get the default language", async () => {
    const result = await GetDefaultLanguageTool.handler(
      {},
      createMockRequestHandlerExtra()
    );
    // Verify the handler response using snapshot
    validateToolResponse(GetDefaultLanguageTool, result);
    expect(result).toMatchSnapshot();
  });

  it("should handle error from client", async () => {
    // Mock the client to throw
    UmbracoManagementClient.getClient = () =>
      ({
        getItemLanguageDefault: () => {
          throw new Error("Simulated error");
        },
      } as any);
    const result = await GetDefaultLanguageTool.handler(
      {},
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
  });
});
