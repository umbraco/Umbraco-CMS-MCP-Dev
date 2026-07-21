import GetModelsBuilderStatusTool from "../get/get-models-builder-status.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-models-builder-status", () => {
  setupTestEnvironment();

  it("should get the models builder status", async () => {
    const result = await GetModelsBuilderStatusTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's output schema
    const data = validateToolResponse(GetModelsBuilderStatusTool, result);
    expect(data).toHaveProperty("status");

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });
});