import GetMemberTypeConfigurationTool from "../get/get-member-type-configuration.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

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