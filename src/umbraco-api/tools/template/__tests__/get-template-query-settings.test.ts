import GetTemplateQuerySettingsTool from "../get/get-template-query-settings.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

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
