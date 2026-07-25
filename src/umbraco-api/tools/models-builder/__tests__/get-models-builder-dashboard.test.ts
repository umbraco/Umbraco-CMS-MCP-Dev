import GetModelsBuilderDashboardTool from "../get/get-models-builder-dashboard.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-models-builder-dashboard", () => {
  setupTestEnvironment();

  it("should get the models builder dashboard", async () => {
    const result = await GetModelsBuilderDashboardTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's output schema
    const data = validateToolResponse(GetModelsBuilderDashboardTool, result);
    expect(data).toHaveProperty("mode");
    expect(data).toHaveProperty("canGenerate");

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });
});