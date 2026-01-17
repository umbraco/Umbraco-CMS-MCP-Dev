import GetImagingResizeUrlsTool from "../get/get-imaging-resize-urls.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_MEDIA_UID = "3c6c415c-35a0-4629-891e-683506250c31";

describe("get-imaging-resize-urls", () => {
  setupTestEnvironment();

  it("should generate resize URLs for specific media item", async () => {
    const result = await GetImagingResizeUrlsTool.handler(
      {
        id: [TEST_MEDIA_UID],
        height: 200,
        width: 200,
        mode: undefined
      },
      createMockRequestHandlerExtra()
    );
    // Verify the handler response using snapshot
    validateToolResponse(GetImagingResizeUrlsTool, result);
    expect(result).toMatchSnapshot();
  });

});
