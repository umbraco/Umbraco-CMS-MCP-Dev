import GetTemplateQuerySettingsTool from "../get/get-template-query-settings.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { getTemplateQuerySettingsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

describe("get-template-query-settings", () => {
  setupTestEnvironment();

  it("should get template query settings", async () => {
    const result = await GetTemplateQuerySettingsTool.handler({}, createMockRequestHandlerExtra());

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return settings with expected structure", async () => {
    const result = await GetTemplateQuerySettingsTool.handler({}, createMockRequestHandlerExtra());

    // Parse the response to check structure
    const response = validateStructuredContent(result, getTemplateQuerySettingsResponse);

    expect(response).toHaveProperty('documentTypeAliases');
    expect(response).toHaveProperty('properties');
    expect(Array.isArray(response.documentTypeAliases)).toBe(true);
    expect(Array.isArray(response.properties)).toBe(true);

    if (response.properties.length > 0) {
      const property = response.properties[0];
      expect(property).toHaveProperty('alias');
      expect(property).toHaveProperty('type');
      // Note: properties may not have 'name' field, only 'alias' and 'type'
    }
  });
});
