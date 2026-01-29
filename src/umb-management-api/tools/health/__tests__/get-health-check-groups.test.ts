import GetHealthCheckGroupsTool from "../get/get-health-check-groups.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_SKIP_VALUE = 0;
const TEST_TAKE_VALUE = 10;

describe("get-health-check-groups", () => {
  setupTestEnvironment();

  it("should get health check groups", async () => {
    const result = await GetHealthCheckGroupsTool.handler({
      skip: TEST_SKIP_VALUE,
      take: TEST_TAKE_VALUE
    }, createMockRequestHandlerExtra());

    validateToolResponse(GetHealthCheckGroupsTool, result);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle invalid parameters", async () => {
    const result = await GetHealthCheckGroupsTool.handler({
      skip: -1,
      take: -1
    }, createMockRequestHandlerExtra());

    expect(result).toMatchSnapshot();
  });
});
