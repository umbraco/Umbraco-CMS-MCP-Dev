import GetMediaConfigurationTool from "../get/get-media-configuration.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";

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
