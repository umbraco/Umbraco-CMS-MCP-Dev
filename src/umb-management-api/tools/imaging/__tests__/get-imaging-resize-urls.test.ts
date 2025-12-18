import GetImagingResizeUrlsTool from "../get/get-imaging-resize-urls.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { jest } from "@jest/globals";

const TEST_MEDIA_UID = "3c6c415c-35a0-4629-891e-683506250c31";

describe("get-imaging-resize-urls", () => {
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

  it("should generate resize URLs for specific media item", async () => {
    const result = await GetImagingResizeUrlsTool.handler(
      {
        id: [TEST_MEDIA_UID],
        height: 200,
        width: 200
      },
      { signal: new AbortController().signal }
    );
    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });

});