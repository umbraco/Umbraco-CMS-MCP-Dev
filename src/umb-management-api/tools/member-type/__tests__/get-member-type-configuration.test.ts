import GetMemberTypeConfigurationTool from "../get/get-member-type-configuration.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("get-member-type-configuration", () => {
  setupTestEnvironment();

  it("should get the global member type configuration", async () => {
    const result = await GetMemberTypeConfigurationTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's output schema
    const config = validateToolResponse(GetMemberTypeConfigurationTool, result);
    expect(config).toMatchSnapshot();
  });
}); 