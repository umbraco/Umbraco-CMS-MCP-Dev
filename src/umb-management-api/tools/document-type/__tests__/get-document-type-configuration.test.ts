import GetDocumentTypeConfigurationTool from "../get/get-document-type-configuration.js";
import { getDocumentTypeConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { jest } from "@jest/globals";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("get-document-type-configuration", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("should get the global document type configuration", async () => {
    const result = await GetDocumentTypeConfigurationTool.handler({} as any, createMockRequestHandlerExtra());
    const config = validateStructuredContent(result, getDocumentTypeConfigurationResponse);
    expect(config).toMatchSnapshot();
  });
}); 