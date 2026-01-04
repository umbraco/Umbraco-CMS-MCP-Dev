import GetHealthCheckGroupsTool from "../get/get-health-check-groups.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_SKIP_VALUE = 0;
const TEST_TAKE_VALUE = 10;

describe("get-health-check-groups", () => {
  setupTestEnvironment();

  it("should get health check groups", async () => {
    const result = await GetHealthCheckGroupsTool.handler({
      skip: TEST_SKIP_VALUE,
      take: TEST_TAKE_VALUE
    }, createMockRequestHandlerExtra());

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
