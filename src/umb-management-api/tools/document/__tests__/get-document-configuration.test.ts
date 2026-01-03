import GetDocumentConfigurationTool from "../get/get-document-configuration.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { getDocumentConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

describe("get-document-configuration", () => {
  setupTestEnvironment();
  it("should get the document configuration", async () => {
    const result = await GetDocumentConfigurationTool.handler({}, createMockRequestHandlerExtra());
    expect(createSnapshotResult(result)).toMatchSnapshot();
    const data = validateStructuredContent(result, getDocumentConfigurationResponse);
    expect(data).toHaveProperty("disableDeleteWhenReferenced");
    expect(data).toHaveProperty("disableUnpublishWhenReferenced");
    expect(data).toHaveProperty("allowEditInvariantFromNonDefault");
    expect(data).toHaveProperty("allowNonExistingSegmentsCreation");
  });
}); 