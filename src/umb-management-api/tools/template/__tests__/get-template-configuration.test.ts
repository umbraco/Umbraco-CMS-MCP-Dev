import GetTemplateConfigurationTool from "../get/get-template-configuration.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { getTemplateConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

describe("get-template-configuration", () => {
  setupTestEnvironment();

  it("should get the template configuration", async () => {
    // Act
    const result = await GetTemplateConfigurationTool.handler({}, createMockRequestHandlerExtra());

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify expected properties exist
    const parsed = validateStructuredContent(result, getTemplateConfigurationResponse);
    expect(parsed).toHaveProperty("disabled");
  });
});
