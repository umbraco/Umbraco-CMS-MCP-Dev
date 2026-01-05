import GetMediaConfigurationTool from "../get/get-media-configuration.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("get-media-configuration", () => {
  setupTestEnvironment();

  it("should get media configuration", async () => {
    const result = await GetMediaConfigurationTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );

    expect(result).toBeDefined();
    expect(result.structuredContent).toBeDefined();
    expect(result).toMatchSnapshot();
  });
});
