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
    // As of Umbraco 17.6 the underlying POST /redirect-management/status endpoint is
    // deprecated: it still returns success but no longer modifies the configuration.
    // Redirect URL tracking is now controlled by the
    // Umbraco:CMS:WebRouting:DisableRedirectUrlTracking configuration key instead.
    it("should succeed but no longer change the status", async () => {
      const before = validateToolResponse(
        GetRedirectStatusTool,
        await GetRedirectStatusTool.handler({}, createMockRequestHandlerExtra())
      );

      try {
        const updateResult = await UpdateRedirectStatusTool.handler(
          { status: before.status === "Enabled" ? "Disabled" : "Enabled" },
          createMockRequestHandlerExtra()
        );
        expect(updateResult.isError).toBeFalsy();

        await new Promise(resolve => setTimeout(resolve, 500));
        const after = validateToolResponse(
          GetRedirectStatusTool,
          await GetRedirectStatusTool.handler({}, createMockRequestHandlerExtra())
        );
        expect(after.status).toBe(before.status);
      } finally {
        // Defensive restore. On 17.6+ this is itself a no-op, but if the endpoint
        // ever does take effect again, leaving tracking disabled would break
        // redirect-management.test.ts, which needs it enabled to create redirects.
        const current = validateToolResponse(
          GetRedirectStatusTool,
          await GetRedirectStatusTool.handler({}, createMockRequestHandlerExtra())
        );
        if (current.status !== before.status) {
          await UpdateRedirectStatusTool.handler(
            { status: before.status },
            createMockRequestHandlerExtra()
          );
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    });
  });
});