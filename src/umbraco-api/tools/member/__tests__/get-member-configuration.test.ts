import GetMemberConfigurationTool from "../get/get-member-configuration.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

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
