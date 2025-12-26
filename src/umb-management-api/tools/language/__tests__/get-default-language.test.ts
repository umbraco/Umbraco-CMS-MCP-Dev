import GetDefaultLanguageTool from "../get/get-default-language.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { jest } from "@jest/globals";

describe("get-default-language", () => {
  let originalConsoleError: typeof console.error;
  let originalGetClient: typeof UmbracoManagementClient.getClient;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    originalGetClient = UmbracoManagementClient.getClient;
  });

  afterEach(() => {
    console.error = originalConsoleError;
    UmbracoManagementClient.getClient = originalGetClient;
  });

  it("should get the default language", async () => {
    const result = await GetDefaultLanguageTool.handler(
      {},
      createMockRequestHandlerExtra()
    );
    // Verify the handler response using snapshot
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
