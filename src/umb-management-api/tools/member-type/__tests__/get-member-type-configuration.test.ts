import GetMemberTypeConfigurationTool from "../get/get-member-type-configuration.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("get-member-type-configuration", () => {
  setupTestEnvironment();

  it("should get the global member type configuration", async () => {
    const result = await GetMemberTypeConfigurationTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );
    const config = result.structuredContent;
    expect(config).toMatchSnapshot();
  });
}); 