import GetLogViewerLevelTool from "../get/get-log-viewer-level.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { withCursorPagination } from "@umbraco-cms/mcp-server-sdk";

describe("get-log-viewer-level", () => {
  setupTestEnvironment();

  it("should get log viewer levels with default parameters", async () => {
    const cursorTool = withCursorPagination(GetLogViewerLevelTool);
    const result = await cursorTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });

  it("should get log viewer levels with custom pagination", async () => {
    const cursorTool = withCursorPagination({ ...GetLogViewerLevelTool, pageSize: 2 });
    const result = await cursorTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });
});
