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
        mode: undefined,
        format: undefined
      },
      createMockRequestHandlerExtra()
    );
    // Verify the handler response using snapshot.
    // The hmac= query param is signed with a server-specific secret so it
    // differs between machines (local vs CI) — normalize before snapshot.
    validateToolResponse(GetImagingResizeUrlsTool, result);
    const normalized = JSON.parse(
      JSON.stringify(result).replace(/hmac=[a-f0-9]+/g, "hmac=NORMALIZED")
    );
    expect(normalized).toMatchSnapshot();
  });

});
