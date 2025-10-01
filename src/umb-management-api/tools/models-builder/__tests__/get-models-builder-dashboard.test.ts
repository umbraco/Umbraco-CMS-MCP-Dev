import GetModelsBuilderDashboardTool from "../get/get-models-builder-dashboard.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { jest } from "@jest/globals";

describe("get-models-builder-dashboard", () => {
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

  it("should get the models builder dashboard", async () => {
    const result = await GetModelsBuilderDashboardTool().handler(
      {},
      { signal: new AbortController().signal }
    );
    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });

});