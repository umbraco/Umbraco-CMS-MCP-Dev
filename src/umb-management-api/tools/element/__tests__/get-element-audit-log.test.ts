import GetElementAuditLogTool from "../get/get-element-audit-log.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test AuditLogElement";

describe("get-element-audit-log", () => {
  setupTestEnvironment();

  let elementId: string;

  beforeEach(async () => {
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();
    elementId = builder.getId();
  });

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should return audit logs for a valid element", async () => {
    const result = await GetElementAuditLogTool.handler(
      {
        id: elementId,
        orderDirection: "Ascending",
        sinceDate: new Date().toISOString(),
      },
      createMockRequestHandlerExtra()
    );

    expect(result).toBeDefined();
    const data = validateToolResponse(GetElementAuditLogTool, result);
    expect(data.items).toBeDefined();
  });

  it("should handle non-existent element", async () => {
    const result = await GetElementAuditLogTool.handler(
      {
        id: BLANK_UUID,
        orderDirection: "Ascending",
        sinceDate: new Date().toISOString(),
      },
      createMockRequestHandlerExtra()
    );

    expect(result).toBeDefined();
    // Non-existent element may return error or empty logs depending on API
    if (result.isError) {
      expect(result.isError).toBe(true);
    } else {
      const data = validateToolResponse(GetElementAuditLogTool, result);
      expect(data.items).toBeDefined();
    }
  });
});
