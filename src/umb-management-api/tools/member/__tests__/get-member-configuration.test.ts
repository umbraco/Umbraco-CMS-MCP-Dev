import GetMemberConfigurationTool from "../get/get-member-configuration.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("get-member-configuration", () => {
  setupTestEnvironment();

  it("should get member configuration", async () => {
    const result = await GetMemberConfigurationTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's output schema
    const config = validateToolResponse(GetMemberConfigurationTool, result);
    expect(config).toBeDefined();
    expect(config).toMatchSnapshot();
  });
});
