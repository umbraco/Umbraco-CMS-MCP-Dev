import GetDocumentTypeConfigurationTool from "../get/get-document-type-configuration.js";
import { getDocumentTypeConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-document-type-configuration", () => {
  setupTestEnvironment();
  it("should get the global document type configuration", async () => {
    const result = await GetDocumentTypeConfigurationTool.handler({} as any, createMockRequestHandlerExtra());
    const config = validateStructuredContent(result, getDocumentTypeConfigurationResponse);
    expect(config).toMatchSnapshot();
  });
}); 