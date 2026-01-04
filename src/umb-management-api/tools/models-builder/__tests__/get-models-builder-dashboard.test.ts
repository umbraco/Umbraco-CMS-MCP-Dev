import GetModelsBuilderDashboardTool from "../get/get-models-builder-dashboard.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("get-models-builder-dashboard", () => {
  setupTestEnvironment();

  it("should get the models builder dashboard", async () => {
    const result = await GetModelsBuilderDashboardTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );
    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });
});