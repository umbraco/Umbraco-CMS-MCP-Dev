import GetIndexerTool from "../get/get-indexer.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

describe("get-indexer", () => {
  setupTestEnvironment();

  it("should list all indexes with default parameters", async () => {
    const result = await GetIndexerTool.handler(
      { skip: undefined, take: 100 },
      createMockRequestHandlerExtra()
    );

    // Normalize dynamic values that change based on content/schema
    const snapshot = createSnapshotResult(result);
    if (snapshot.structuredContent?.items && Array.isArray(snapshot.structuredContent.items)) {
      snapshot.structuredContent.items = snapshot.structuredContent.items.map((item: any) => ({
        ...item,
        documentCount: "NORMALIZED_COUNT",
        fieldCount: "NORMALIZED_COUNT"
      }));
    }

    // Verify the handler response using snapshot
    expect(snapshot).toMatchSnapshot();
  });
});
