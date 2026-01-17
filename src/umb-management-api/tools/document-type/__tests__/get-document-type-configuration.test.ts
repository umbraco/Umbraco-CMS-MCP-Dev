import GetDocumentTypeConfigurationTool from "../get/get-document-type-configuration.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-document-type-configuration", () => {
  setupTestEnvironment();
  it("should get the global document type configuration", async () => {
    const result = await GetDocumentTypeConfigurationTool.handler({} as any, createMockRequestHandlerExtra());
    const config = validateToolResponse(GetDocumentTypeConfigurationTool, result);
    expect(config).toMatchSnapshot();
  });
});