/**
 * Cursor Pagination Integration Tests
 *
 * Verifies that withCursorPagination correctly transforms paginated tools
 * when applied at registration time. Tests use real tool definitions from
 * the codebase to ensure the decorator works with actual zod schemas.
 */

import {
  withCursorPagination,
  encodeCursor,
  decodeCursor,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { availableCollections } from "../collection-registry.js";
import { sections } from "auth/umbraco-auth-policies.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

// Create a mock admin user for tool enablement checks
const mockAdminUser = {
  allowedSections: Object.values(sections),
  userGroupIds: [{ id: "e5e7f6c8-7f9c-4b5b-8d5d-9e1e5a4f7e4d" }],
} as CurrentUserResponseModel;

/**
 * Find a tool by name across all collections.
 */
function findTool(name: string): ToolDefinition<any, any> | undefined {
  for (const collection of availableCollections) {
    const tools = collection.tools(mockAdminUser);
    const found = tools.find(t => t.name === name);
    if (found) return found;
  }
  return undefined;
}

describe("cursor-pagination integration", () => {
  setupTestEnvironment();

  describe("schema transformation with real tools", () => {
    it("should transform get-webhook to use cursor instead of skip/take", () => {
      const tool = findTool("get-webhook")!;
      expect(tool).toBeDefined();
      const transformed = withCursorPagination(tool);

      expect(transformed.inputSchema).toHaveProperty("cursor");
      expect(transformed.inputSchema).not.toHaveProperty("skip");
      expect(transformed.inputSchema).not.toHaveProperty("take");
      expect(transformed.name).toBe("get-webhook");
    });

    it("should transform find-dictionary and preserve filter param", () => {
      const tool = findTool("find-dictionary")!;
      expect(tool).toBeDefined();
      const transformed = withCursorPagination(tool);

      expect(transformed.inputSchema).toHaveProperty("cursor");
      expect(transformed.inputSchema).toHaveProperty("filter");
      expect(transformed.inputSchema).not.toHaveProperty("skip");
      expect(transformed.inputSchema).not.toHaveProperty("take");
    });

    it("should transform get-document-root and preserve non-pagination params", () => {
      const tool = findTool("get-document-root")!;
      expect(tool).toBeDefined();
      const transformed = withCursorPagination(tool);

      expect(transformed.inputSchema).toHaveProperty("cursor");
      expect(transformed.inputSchema).not.toHaveProperty("skip");
      expect(transformed.inputSchema).not.toHaveProperty("take");
    });

    it("should add nextCursor to output schema", () => {
      const tool = findTool("get-webhook")!;
      const transformed = withCursorPagination(tool);

      expect(transformed.outputSchema).toHaveProperty("nextCursor");
      expect(transformed.outputSchema).toHaveProperty("total");
      expect(transformed.outputSchema).toHaveProperty("items");
    });

    it("should not transform tools without skip/take", () => {
      const tool = findTool("get-server-status")!;
      expect(tool).toBeDefined();
      const transformed = withCursorPagination(tool);

      // Should be same reference — no transformation
      expect(transformed).toBe(tool);
    });
  });

  describe("handler with real Umbraco API", () => {
    let languageTool: ToolDefinition<any, any>;

    beforeAll(() => {
      const tool = findTool("get-language");
      expect(tool).toBeDefined();
      languageTool = tool!;
    });

    it("should fetch first page without cursor", async () => {
      const transformed = withCursorPagination(languageTool);

      const result = await transformed.handler(
        {},
        createMockRequestHandlerExtra()
      );

      expect(result.isError).toBeFalsy();
      expect(result.structuredContent).toBeDefined();

      const sc = result.structuredContent as any;
      expect(sc.total).toBeGreaterThan(0);
      expect(sc.items).toBeDefined();
      expect(Array.isArray(sc.items)).toBe(true);
    });

    it("should return nextCursor when more results exist", async () => {
      const tool = { ...languageTool, pageSize: 1 };
      const transformed = withCursorPagination(tool);

      const result = await transformed.handler(
        {},
        createMockRequestHandlerExtra()
      );

      const sc = result.structuredContent as any;
      if (sc.total > 1) {
        expect(sc.nextCursor).toBeDefined();
        const state = decodeCursor(sc.nextCursor);
        expect(state.s).toBe(1);
        expect(state.t).toBe(1);
      }
    });

    it("should fetch second page using cursor from first page", async () => {
      const tool = { ...languageTool, pageSize: 1 };
      const transformed = withCursorPagination(tool);

      // First page
      const page1 = await transformed.handler(
        {},
        createMockRequestHandlerExtra()
      );
      const sc1 = page1.structuredContent as any;

      if (sc1.total <= 1) return; // Can't test pagination with single item

      expect(sc1.nextCursor).toBeDefined();

      // Second page
      const page2 = await transformed.handler(
        { cursor: sc1.nextCursor },
        createMockRequestHandlerExtra()
      );
      const sc2 = page2.structuredContent as any;

      expect(sc2.total).toBe(sc1.total);
      expect(sc2.items.length).toBeGreaterThan(0);

      // Items should be different
      const page1Ids = sc1.items.map((i: any) => i.isoCode);
      const page2Ids = sc2.items.map((i: any) => i.isoCode);
      expect(page1Ids).not.toEqual(page2Ids);
    });

    it("should return error for invalid cursor", async () => {
      const transformed = withCursorPagination(languageTool);

      const result = await transformed.handler(
        { cursor: "invalid-garbage-cursor" },
        createMockRequestHandlerExtra()
      );

      expect(result.isError).toBe(true);
      expect((result.structuredContent as any).title).toBe("Invalid Cursor");
    });

    it("should not return nextCursor on last page", async () => {
      const tool = { ...languageTool, pageSize: 1000 };
      const transformed = withCursorPagination(tool);

      const result = await transformed.handler(
        {},
        createMockRequestHandlerExtra()
      );

      const sc = result.structuredContent as any;
      expect(sc.nextCursor).toBeUndefined();
    });

    it("should update text content fallback with nextCursor", async () => {
      const tool = { ...languageTool, pageSize: 1 };
      const transformed = withCursorPagination(tool);

      const result = await transformed.handler(
        {},
        createMockRequestHandlerExtra()
      );

      const sc = result.structuredContent as any;
      if (sc.total > 1 && result.content?.[0]?.text) {
        const textContent = JSON.parse(result.content[0].text);
        expect(textContent.nextCursor).toBeDefined();
        expect(textContent.nextCursor).toBe(sc.nextCursor);
      }
    });
  });
});
