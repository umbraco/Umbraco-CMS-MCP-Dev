import GetDocumentPublishTool from "../get/get-document-publish.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_DOCUMENT_NAME = "_Test GetDocumentPublish";

describe("get-document-publish", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should get the published state of a published document", async () => {
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();
    await builder.publish();
    const item = builder.getCreatedItem();

    const result = await GetDocumentPublishTool.handler(
      {
        id: item.id,
      },
      createMockRequestHandlerExtra()
    );
    const snapshot = createSnapshotResult(result, item.id);
    expect(snapshot).toMatchSnapshot();

    // Parse and check published state
    const data = validateToolResponse(GetDocumentPublishTool, result);
    expect(data.variants.some((v: any) => v.state === "Published")).toBe(
      true
    );
  });

  it("should handle getting published state for a non-existent document", async () => {
    const result = await GetDocumentPublishTool.handler(
      {
        id: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBe(true);
  });
});
