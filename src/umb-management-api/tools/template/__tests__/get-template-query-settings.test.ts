import GetTemplateQuerySettingsTool from "../get/get-template-query-settings.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-template-query-settings", () => {
  setupTestEnvironment();

  it("should get template query settings", async () => {
    const result = await GetTemplateQuerySettingsTool.handler({}, createMockRequestHandlerExtra());

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return settings with expected structure", async () => {
    const result = await GetTemplateQuerySettingsTool.handler({}, createMockRequestHandlerExtra());

    // Parse the response to check structure
    const data = validateToolResponse(GetTemplateQuerySettingsTool, result);

    expect(data).toHaveProperty('documentTypeAliases');
    expect(data).toHaveProperty('properties');
    expect(Array.isArray(data.documentTypeAliases)).toBe(true);
    expect(Array.isArray(data.properties)).toBe(true);

    if (data.properties.length > 0) {
      const property = data.properties[0];
      expect(property).toHaveProperty('alias');
      expect(property).toHaveProperty('type');
      // Note: properties may not have 'name' field, only 'alias' and 'type'
    }
  });
});
