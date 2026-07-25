import GetTemporaryFileConfigurationTool from "../get/get-temporary-file-configuration.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-temporary-file-configuration", () => {
  setupTestEnvironment();

  it("should get the global temporary file configuration", async () => {
    const result = await GetTemporaryFileConfigurationTool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
