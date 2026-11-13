import { jest } from "@jest/globals";
import GetDocumentPublishWithDescendantsResultTool from "../get/get-document-publish-with-descendants-result.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCUMENT_NAME = "_Test GetDocumentPublishWithDescendantsResult";
const UNKNOWN_TASK_ID = "11111111-1111-1111-1111-111111111111";

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

  it("should return an error for a taskId that does not exist on an existing document", async () => {
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();

    const result: any = await GetDocumentPublishWithDescendantsResultTool.handler(
      { id: builder.getId(), taskId: UNKNOWN_TASK_ID },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
    expect(JSON.parse(result.content[0].text).status).toBe(404);
  });

  it("should return the failed branch items when the publish finished with failures", async () => {
    const failedBranchProblem = {
      type: "Error",
      title: "Failed branch publish",
      status: 400,
      detail: "One or more items in the branch could not be published.",
      failedBranchItems: [
        { id: "33333333-3333-3333-3333-333333333333", operationStatus: "CancelledByEvent" },
      ],
    };

    const clientSpy = jest.spyOn(UmbracoManagementClient, "getClient").mockReturnValue({
      getDocumentByIdPublishWithDescendantsResultByTaskId: jest.fn(async () => ({
        status: 400,
        statusText: "Bad Request",
        data: failedBranchProblem,
      })),
    } as any);

    try {
      const result: any = await GetDocumentPublishWithDescendantsResultTool.handler(
        { id: "22222222-2222-2222-2222-222222222222", taskId: UNKNOWN_TASK_ID },
        createMockRequestHandlerExtra()
      );

      expect(result.isError).toBe(true);
      expect(JSON.parse(result.content[0].text).failedBranchItems).toEqual(
        failedBranchProblem.failedBranchItems
      );
    } finally {
      clientSpy.mockRestore();
    }
  });
});
