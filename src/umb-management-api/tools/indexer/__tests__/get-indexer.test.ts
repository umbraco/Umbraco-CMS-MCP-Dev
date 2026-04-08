import GetIndexerTool from "../get/get-indexer.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { withCursorPagination } from "@umbraco-cms/mcp-server-sdk";

describe("get-indexer", () => {
  setupTestEnvironment();

  it("should list all indexes with default parameters", async () => {
    const cursorTool = withCursorPagination(GetIndexerTool);
    const result = await cursorTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Validate the response schema
    validateToolResponse(cursorTool, result);

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
