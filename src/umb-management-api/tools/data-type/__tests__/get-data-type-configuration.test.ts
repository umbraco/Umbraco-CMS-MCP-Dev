import GetDataTypeConfigurationTool from "../get/get-data-type-configuration.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { getDataTypeConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

describe("get-data-type-configuration", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

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