import GetRedirectStatusTool from "../get/get-redirect-status.js";
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
});
