import GetMemberGroupByIdArrayTool from "../get/get-member-group-by-id-array.js";
import { MemberGroupBuilder } from "./helpers/member-group-builder.js";
import { MemberGroupTestHelper } from "./helpers/member-group-helper.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { BLANK_UUID } from "@/constants/constants.js";

describe("get-item-member-group", () => {
  const TEST_GROUP_NAME_1 = "_Test Item Member Group 1";
  const TEST_GROUP_NAME_2 = "_Test Item Member Group 2";
  setupTestEnvironment();

  afterEach(async () => {
    await MemberGroupTestHelper.cleanup(TEST_GROUP_NAME_1);
    await MemberGroupTestHelper.cleanup(TEST_GROUP_NAME_2);
  });

  it("should get no member groups for empty request", async () => {
    const result = await GetMemberGroupByIdArrayTool.handler(
      {},
      createMockRequestHandlerExtra()
    );
    // executeGetApiCall returns the array directly in structuredContent
    const items = result.structuredContent as any[] ?? [];
    expect(items).toMatchSnapshot();
  });

  it("should get single member group by ID", async () => {
    const builder = await new MemberGroupBuilder()
      .withName(TEST_GROUP_NAME_1)
      .create();
    const result = await GetMemberGroupByIdArrayTool.handler(
      { id: [builder.getId()] },
      createMockRequestHandlerExtra()
    );
    const items = ((result.structuredContent as any)?.items ?? []) as any[];
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe(TEST_GROUP_NAME_1);
    items[0].id = BLANK_UUID;
    expect(items).toMatchSnapshot();
  });

  it("should get multiple member groups by ID", async () => {
    const builder1 = await new MemberGroupBuilder()
      .withName(TEST_GROUP_NAME_1)
      .create();
    const builder2 = await new MemberGroupBuilder()
      .withName(TEST_GROUP_NAME_2)
      .create();
    const result = await GetMemberGroupByIdArrayTool.handler(
      { id: [builder1.getId(), builder2.getId()] },
      createMockRequestHandlerExtra()
    );
    const items = ((result.structuredContent as any)?.items ?? []) as any[];
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe(TEST_GROUP_NAME_1);
    expect(items[1].name).toBe(TEST_GROUP_NAME_2);
    items.forEach((item: any) => {
      item.id = BLANK_UUID;
    });
    expect(items).toMatchSnapshot();
  });
});
