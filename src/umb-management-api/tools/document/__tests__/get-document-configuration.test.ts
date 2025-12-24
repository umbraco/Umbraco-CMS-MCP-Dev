import GetDocumentConfigurationTool from "../get/get-document-configuration.js";
import { jest } from "@jest/globals";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { getDocumentConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

describe("get-document-configuration", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

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