import GetUserCurrentLoginProvidersTool from "../get/get-user-current-login-providers.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-user-current-login-providers", () => {
  setupTestEnvironment();

  it("should get current user's login providers", async () => {
    // Act
    const result = await GetUserCurrentLoginProvidersTool.handler({}, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify expected structure - tool returns { items: [...] }
    const items = (result.structuredContent as any).items;
    expect(Array.isArray(items)).toBe(true);

    // Each provider should have expected properties
    if (items.length > 0) {
      expect(items[0]).toHaveProperty("providerSchemeName");
      expect(typeof items[0].providerSchemeName).toBe("string");
    }
  });
});
