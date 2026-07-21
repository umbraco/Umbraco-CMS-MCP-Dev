import GetDocumentConfigurationTool from "../get/get-document-configuration.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-document-configuration", () => {
  setupTestEnvironment();
  it("should get the document configuration", async () => {
    const result = await GetDocumentConfigurationTool.handler({}, createMockRequestHandlerExtra());
    expect(createSnapshotResult(result)).toMatchSnapshot();
    const data = validateToolResponse(GetDocumentConfigurationTool, result);
    expect(data).toHaveProperty("disableDeleteWhenReferenced");
    expect(data).toHaveProperty("disableUnpublishWhenReferenced");
    expect(data).toHaveProperty("allowEditInvariantFromNonDefault");
    expect(data).toHaveProperty("allowNonExistingSegmentsCreation");
  });
}); 