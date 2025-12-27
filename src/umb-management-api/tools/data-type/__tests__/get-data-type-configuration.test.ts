import GetDataTypeConfigurationTool from "../get/get-data-type-configuration.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { getDataTypeConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

describe("get-data-type-configuration", () => {
  setupTestEnvironment();
  it("should get the data type configuration", async () => {
    // Act - Get the data type configuration
    const result = await GetDataTypeConfigurationTool.handler({}, createMockRequestHandlerExtra());

    // Assert - Verify the handler response matches schema
    const data = validateStructuredContent(result, getDataTypeConfigurationResponse);
    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Assert - Verify expected properties exist
    expect(data).toHaveProperty("canBeChanged");
    expect(data).toHaveProperty("documentListViewId");
    expect(data).toHaveProperty("mediaListViewId");
  });
});