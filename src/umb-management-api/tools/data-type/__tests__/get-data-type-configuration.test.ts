import GetDataTypeConfigurationTool from "../get/get-data-type-configuration.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-data-type-configuration", () => {
  setupTestEnvironment();
  it("should get the data type configuration", async () => {
    // Act - Get the data type configuration
    const result = await GetDataTypeConfigurationTool.handler({}, createMockRequestHandlerExtra());

    // Assert - Verify the handler response matches schema
    const data = validateToolResponse(GetDataTypeConfigurationTool, result);
    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Assert - Verify expected properties exist
    expect(data).toHaveProperty("canBeChanged");
    expect(data).toHaveProperty("documentListViewId");
    expect(data).toHaveProperty("mediaListViewId");
  });
});