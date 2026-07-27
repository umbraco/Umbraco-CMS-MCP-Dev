import GetHealthCheckGroupByNameTool from "../get/get-health-check-group-by-name.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_INVALID_GROUP_NAME = "_NonExistentHealthCheckGroup";
const TEST_EMPTY_GROUP_NAME = "";
const TEST_VALID_GROUP_NAME = "Data Integrity";

describe("get-health-check-group-by-name", () => {
  setupTestEnvironment();

  it("should get health check group by valid name", async () => {
    const result = await GetHealthCheckGroupByNameTool.handler({
      name: TEST_VALID_GROUP_NAME
    }, createMockRequestHandlerExtra());

    validateToolResponse(GetHealthCheckGroupByNameTool, result);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle non-existent health check group", async () => {
    const result = await GetHealthCheckGroupByNameTool.handler({
      name: TEST_INVALID_GROUP_NAME
    }, createMockRequestHandlerExtra());

    expect(result).toMatchSnapshot();
  });

  it("should handle empty group name", async () => {
    const result = await GetHealthCheckGroupByNameTool.handler({
      name: TEST_EMPTY_GROUP_NAME
    }, createMockRequestHandlerExtra());

    expect(result).toMatchSnapshot();
  });
});
