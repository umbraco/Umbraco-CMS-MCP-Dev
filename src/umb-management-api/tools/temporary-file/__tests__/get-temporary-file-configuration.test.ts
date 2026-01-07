import GetTemporaryFileConfigurationTool from "../get/get-temporary-file-configuration.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

describe("get-temporary-file-configuration", () => {
  setupTestEnvironment();

  it("should get the global temporary file configuration", async () => {
    const result = await GetTemporaryFileConfigurationTool.handler({}, createMockRequestHandlerExtra());
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
