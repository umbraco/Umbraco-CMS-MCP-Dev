import GetElementConfigurationTool from "../get/get-element-configuration.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-element-configuration", () => {
  setupTestEnvironment();

  it("should get the element configuration", async () => {
    const result = await GetElementConfigurationTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    expect(createSnapshotResult(result)).toMatchSnapshot();
    const data = validateToolResponse(GetElementConfigurationTool, result);
    expect(data).toHaveProperty("disableDeleteWhenReferenced");
    expect(data).toHaveProperty("disableUnpublishWhenReferenced");
    expect(data).toHaveProperty("allowEditInvariantFromNonDefault");
    expect(data).toHaveProperty("allowNonExistingSegmentsCreation");
  });
});
