import GetRedirectStatusTool from "../get/get-redirect-status.js";
import UpdateRedirectStatusTool from "../post/update-redirect-status.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("Redirect Status Tools", () => {
  setupTestEnvironment();

  describe("GetRedirectStatusTool", () => {
    it("should get the current redirect status", async () => {
      const result = await GetRedirectStatusTool.handler({}, createMockRequestHandlerExtra());
      const data = validateToolResponse(GetRedirectStatusTool, result);
      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("userIsAdmin");
    });
  });

  describe("UpdateRedirectStatusTool", () => {
    it("should disable redirect management", async () => {
      await UpdateRedirectStatusTool.handler(
        { status: "Disabled" },
        createMockRequestHandlerExtra()
      );

      await new Promise(resolve => setTimeout(resolve, 500));
      const status = await GetRedirectStatusTool.handler({}, createMockRequestHandlerExtra());
      const data = validateToolResponse(GetRedirectStatusTool, status);
      expect(data.status).toBe("Disabled");
    });

    // Ensure redirect management is enabled after each test
    afterEach(async () => {
      await UpdateRedirectStatusTool.handler(
        { status: "Enabled" },
        createMockRequestHandlerExtra()
      );
      await new Promise(resolve => setTimeout(resolve, 500));
    });
  });
});