import GetDocumentPublishWithDescendantsResultTool from "../get/get-document-publish-with-descendants-result.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCUMENT_NAME = "_Test GetDocumentPublishWithDescendantsResult";

describe("get-document-publish-with-descendants-result", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("gets the result of a publish-with-descendants operation by taskId", async () => {
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();
    const id = builder.getId();

    const client = UmbracoManagementClient.getClient();
    const initialResponse = await client.putDocumentByIdPublishWithDescendants(id, {
      includeUnpublishedDescendants: true,
      cultures: [],
    });

    // The publish-with-descendants operation runs asynchronously, so poll the
    // tool under test until it reports completion (bounded, so a genuine
    // regression fails the test instead of hanging).
    let data: { taskId: string; isComplete: boolean } | undefined;
    for (let attempt = 0; attempt < 20; attempt++) {
      const result = await GetDocumentPublishWithDescendantsResultTool.handler(
        { id, taskId: initialResponse.taskId },
        createMockRequestHandlerExtra()
      );
      data = validateToolResponse(GetDocumentPublishWithDescendantsResultTool, result);
      if (data.isComplete) break;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    // taskId is freshly generated per operation, so it's asserted directly
    // rather than snapshotted.
    expect(data?.taskId).toBe(initialResponse.taskId);
    expect(data?.isComplete).toBe(true);
  });

  it("should handle an unknown taskId", async () => {
    const result = await GetDocumentPublishWithDescendantsResultTool.handler(
      { id: BLANK_UUID, taskId: BLANK_UUID },
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBe(true);
  });
});
