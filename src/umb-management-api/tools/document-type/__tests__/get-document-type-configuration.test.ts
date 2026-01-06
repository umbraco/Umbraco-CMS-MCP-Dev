import GetDocumentTypeConfigurationTool from "../get/get-document-type-configuration.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-document-type-configuration", () => {
  setupTestEnvironment();
  it("should get the global document type configuration", async () => {
    const result = await GetDocumentTypeConfigurationTool.handler({} as any, createMockRequestHandlerExtra());
    const config = validateToolResponse(GetDocumentTypeConfigurationTool, result);
    expect(config).toMatchSnapshot();
  });
});