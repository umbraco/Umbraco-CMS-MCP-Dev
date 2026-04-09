import GetAllMemberGroupsTool from "../get/get-all-member-groups.js";
import { MemberGroupBuilder } from "./helpers/member-group-builder.js";
import { MemberGroupTestHelper } from "./helpers/member-group-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";
import { withCursorPagination } from "@umbraco-cms/mcp-server-sdk";

const TEST_GROUP_NAME_1 = "_Test Get All Member Groups 1";
const TEST_GROUP_NAME_2 = "_Test Get All Member Groups 2";

describe("get-all-member-groups", () => {
  setupTestEnvironment();

  let builder1: MemberGroupBuilder;
  let builder2: MemberGroupBuilder;

  beforeEach(async () => {
    builder1 = new MemberGroupBuilder();
    builder2 = new MemberGroupBuilder();
  });

  afterEach(async () => {
    await MemberGroupTestHelper.cleanup(TEST_GROUP_NAME_1);
    await MemberGroupTestHelper.cleanup(TEST_GROUP_NAME_2);
  });

  it("should get all member groups", async () => {
    // Arrange - Create test member groups
    await builder1.withName(TEST_GROUP_NAME_1).create();
    await builder2.withName(TEST_GROUP_NAME_2).create();

    // Act - Get all member groups
    const cursorTool = withCursorPagination(GetAllMemberGroupsTool);
    const result = await cursorTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert - Validate response against tool's output schema
    const data = validateToolResponse(cursorTool, result);
    const names = data.items ? data.items.map((item: any) => item.name) : [];
    expect(names).toEqual(expect.arrayContaining([TEST_GROUP_NAME_1, TEST_GROUP_NAME_2]));
  });

  it("should support pagination with pageSize parameter", async () => {
    // Arrange - Create test member groups
    await builder1.withName(TEST_GROUP_NAME_1).create();
    await builder2.withName(TEST_GROUP_NAME_2).create();

    // Act - Get member groups with pagination (pageSize 1)
    const cursorTool = withCursorPagination({ ...GetAllMemberGroupsTool, pageSize: 1 });
    const result = await cursorTool.handler(
      {},
      createMockRequestHandlerExtra()
    );

    // Assert - Validate response against tool's output schema
    const data = validateToolResponse(cursorTool, result);
    expect(data.items.length).toBeLessThanOrEqual(1);
  });
});
