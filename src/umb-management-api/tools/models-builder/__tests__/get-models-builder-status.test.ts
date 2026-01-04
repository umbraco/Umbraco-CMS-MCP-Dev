import GetModelsBuilderStatusTool from "../get/get-models-builder-status.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("get-models-builder-status", () => {
  setupTestEnvironment();

  it("should get the models builder status", async () => {
    const result = await GetModelsBuilderStatusTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );
    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });
});