import GetDocumentConfigurationTool from "../get/get-document-configuration.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

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