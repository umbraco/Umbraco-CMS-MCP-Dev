import GetMediaTypeConfigurationTool from "../get/get-media-type-configuration.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("get-media-type-configuration", () => {
  setupTestEnvironment();

  it("should get the global media type configuration", async () => {
    const result = await GetMediaTypeConfigurationTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );
    const config = result.structuredContent;
    expect(config).toMatchSnapshot();
  });
});
