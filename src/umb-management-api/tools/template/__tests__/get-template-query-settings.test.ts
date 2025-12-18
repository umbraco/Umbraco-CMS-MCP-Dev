import GetTemplateQuerySettingsTool from "../get/get-template-query-settings.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

describe("get-template-query-settings", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
  });

  it("should get template query settings", async () => {
    const result = await GetTemplateQuerySettingsTool.handler({}, {
      signal: new AbortController().signal,
    });

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return settings with expected structure", async () => {
    const result = await GetTemplateQuerySettingsTool.handler({}, {
      signal: new AbortController().signal,
    });

    // Parse the response to check structure
    const response = JSON.parse(result.content[0].text as string);
    
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