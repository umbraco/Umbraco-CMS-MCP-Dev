import GetUserTool from "../get/get-user.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { withCursorPagination } from "@umbraco-cms/mcp-server-sdk";

describe("get-user", () => {
  setupTestEnvironment();

  it("should get users list with default parameters", async () => {
    // Act
    const cursorTool = withCursorPagination(GetUserTool);
    const result = await cursorTool.handler({}, createMockRequestHandlerExtra());

    // Assert - don't snapshot full list as other parallel tests may create users
    const parsed = validateToolResponse(cursorTool, result);
    expect(parsed.items.length).toBeGreaterThanOrEqual(1); // At least the admin user
    expect(parsed.total).toBeGreaterThanOrEqual(1);
  });

  it("should get users with pagination", async () => {
    // Act
    const cursorTool = withCursorPagination({ ...GetUserTool, pageSize: 5 });
    const result = await cursorTool.handler({}, createMockRequestHandlerExtra());

    // Assert
    const parsed = validateToolResponse(cursorTool, result);
    expect(parsed.items.length).toBeLessThanOrEqual(5);
  });
});
