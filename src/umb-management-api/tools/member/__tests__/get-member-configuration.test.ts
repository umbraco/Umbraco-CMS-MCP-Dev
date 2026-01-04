import GetMemberConfigurationTool from "../get/get-member-configuration.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("get-member-configuration", () => {
  setupTestEnvironment();

  it("should get member configuration", async () => {
    const result = await GetMemberConfigurationTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );

    const config = result.structuredContent;
    expect(config).toBeDefined();
    expect(config).toMatchSnapshot();
  });
});
