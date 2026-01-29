import GetTemplateConfigurationTool from "../get/get-template-configuration.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-template-configuration", () => {
  setupTestEnvironment();

  it("should get the template configuration", async () => {
    // Act
    const result = await GetTemplateConfigurationTool.handler({}, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify expected properties exist
    const data = validateToolResponse(GetTemplateConfigurationTool, result);
    expect(data).toHaveProperty("disabled");
  });
});
