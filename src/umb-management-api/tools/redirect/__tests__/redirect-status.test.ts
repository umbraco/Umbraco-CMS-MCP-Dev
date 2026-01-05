import GetRedirectStatusTool from "../get/get-redirect-status.js";
import UpdateRedirectStatusTool from "../post/update-redirect-status.js";
import { getRedirectManagementStatusResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

type RedirectStatus = z.infer<typeof getRedirectManagementStatusResponse>;

describe("Redirect Status Tools", () => {
  setupTestEnvironment();

  describe("GetRedirectStatusTool", () => {
    it("should get the current redirect status", async () => {
      const result = await GetRedirectStatusTool.handler({}, createMockRequestHandlerExtra());
      const data = validateStructuredContent(result, getRedirectManagementStatusResponse);
      expect(getRedirectManagementStatusResponse.safeParse(data).success).toBe(true);
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
      const data = validateStructuredContent(status, getRedirectManagementStatusResponse);
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