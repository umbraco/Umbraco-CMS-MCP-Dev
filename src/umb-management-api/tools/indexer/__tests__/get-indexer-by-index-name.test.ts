import GetIndexerByIndexNameTool from "../get/get-indexer-by-index-name.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

const TEST_INDEX_NAME = "ExternalIndex";

describe("get-indexer-by-index-name", () => {
  setupTestEnvironment();

  it("should get index by name", async () => {
    const result = await GetIndexerByIndexNameTool.handler(
      { indexName: TEST_INDEX_NAME },
      createMockRequestHandlerExtra()
    );

    // Validate the response schema
    validateToolResponse(GetIndexerByIndexNameTool, result);

    // Normalize documentCount and fieldCount which change based on index state
    const snapshot = createSnapshotResult(result);
    if (snapshot.structuredContent) {
      snapshot.structuredContent.documentCount = "NORMALIZED_COUNT";
      snapshot.structuredContent.fieldCount = "NORMALIZED_FIELD_COUNT";
    }

    // Verify the handler response using snapshot
    expect(snapshot).toMatchSnapshot();
  });

});
