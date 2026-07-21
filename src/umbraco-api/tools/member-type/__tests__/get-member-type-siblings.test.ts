import { MemberTypeTestHelper } from "./helpers/member-type-helper.js";
import GetMemberTypeSiblingsTool from "../items/get/get-siblings.js";
import { MemberTypeBuilder } from "./helpers/member-type-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-member-type-siblings", () => {
  setupTestEnvironment();

  const TEST_SIBLING_1_NAME = "_Test Sibling 1 MemberType";
  const TEST_SIBLING_2_NAME = "_Test Sibling 2 MemberType";
  const TEST_SIBLING_3_NAME = "_Test Sibling 3 MemberType";

  afterEach(async () => {
    await MemberTypeTestHelper.cleanup(TEST_SIBLING_1_NAME);
    await MemberTypeTestHelper.cleanup(TEST_SIBLING_2_NAME);
    await MemberTypeTestHelper.cleanup(TEST_SIBLING_3_NAME);
  });

  it("should get sibling member types at root level", async () => {
    // Arrange - Create multiple sibling member types at root
    const sibling1Builder = await new MemberTypeBuilder()
      .withName(TEST_SIBLING_1_NAME)
      .create();

    await new MemberTypeBuilder()
      .withName(TEST_SIBLING_2_NAME)
      .create();

    await new MemberTypeBuilder()
      .withName(TEST_SIBLING_3_NAME)
      .create();

    // Act - Get siblings using one of the items as target
    const result = await GetMemberTypeSiblingsTool.handler(
      {
        target: sibling1Builder.getId(),
        before: undefined,
        after: undefined,
        foldersOnly: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Assert - Verify the siblings are returned
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent target", async () => {
    // Act - Try to get siblings for non-existent item
    const result = await GetMemberTypeSiblingsTool.handler(
      {
        target: BLANK_UUID,
        before: undefined,
        after: undefined,
        foldersOnly: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
