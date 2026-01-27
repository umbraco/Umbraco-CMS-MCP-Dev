import GetMediaTypeConfigurationTool from "../get/get-media-type-configuration.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-media-type-configuration", () => {
  setupTestEnvironment();

  it("should get the global media type configuration", async () => {
    const result = await GetMediaTypeConfigurationTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's output schema
    const config = validateToolResponse(GetMediaTypeConfigurationTool, result);
    expect(config).toMatchSnapshot();
  });
});
