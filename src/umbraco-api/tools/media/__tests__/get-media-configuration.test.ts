import GetMediaConfigurationTool from "../get/get-media-configuration.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-media-configuration", () => {
  setupTestEnvironment();

  it("should get media configuration", async () => {
    const result = await GetMediaConfigurationTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's outputSchema
    const content = validateToolResponse(GetMediaConfigurationTool, result);
    expect(content).toBeDefined();
    expect(result).toMatchSnapshot();
  });
});
