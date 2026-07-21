import GetMemberTypeBatchTool from "../get/get-member-type-batch.js";
import { MemberTypeBuilder } from "./helpers/member-type-builder.js";
import { MemberTypeTestHelper } from "./helpers/member-type-helper.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-member-type-batch", () => {
  const TEST_MEMBERTYPE_NAME = "_Test Batch MemberType";
  const TEST_MEMBERTYPE_NAME_2 = "_Test Batch MemberType2";
  setupTestEnvironment();

  afterEach(async () => {
    await MemberTypeTestHelper.cleanup(TEST_MEMBERTYPE_NAME);
    await MemberTypeTestHelper.cleanup(TEST_MEMBERTYPE_NAME_2);
  });

  it("should get a single member type with full configuration", async () => {
    // Arrange
    const builder = await new MemberTypeBuilder()
      .withName(TEST_MEMBERTYPE_NAME)
      .create();

    // Act
    const result = await GetMemberTypeBatchTool.handler(
      { id: [builder.getId()] },
      createMockRequestHandlerExtra()
    );

    // Assert
    const data = validateToolResponse(GetMemberTypeBatchTool, result);
    expect(data.total).toBe(1);
    expect(data.items).toHaveLength(1);
    expect(data.items[0].name).toBe(TEST_MEMBERTYPE_NAME);
    // Distinguishing fields vs the lightweight items endpoint:
    expect(data.items[0].properties).toBeDefined();
    expect(data.items[0].compositions).toBeDefined();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should get multiple member types in a single request", async () => {
    // Arrange
    const builder1 = await new MemberTypeBuilder()
      .withName(TEST_MEMBERTYPE_NAME)
      .create();
    const builder2 = await new MemberTypeBuilder()
      .withName(TEST_MEMBERTYPE_NAME_2)
      .create();

    // Act
    const result = await GetMemberTypeBatchTool.handler(
      { id: [builder1.getId(), builder2.getId()] },
      createMockRequestHandlerExtra()
    );

    // Assert
    const data = validateToolResponse(GetMemberTypeBatchTool, result);
    expect(data.total).toBe(2);
    expect(data.items).toHaveLength(2);
    const names = data.items.map((i: any) => i.name).sort();
    expect(names).toEqual([TEST_MEMBERTYPE_NAME, TEST_MEMBERTYPE_NAME_2].sort());
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
