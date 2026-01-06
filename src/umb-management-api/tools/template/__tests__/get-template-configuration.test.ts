import GetTemplateConfigurationTool from "../get/get-template-configuration.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

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
