import { MemberTypeTestHelper } from "./helpers/member-type-helper.js";
import GetMemberTypeSiblingsTool from "../items/get/get-siblings.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { MemberTypeBuilder } from "./helpers/member-type-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";

describe("get-member-type-siblings", () => {
  const TEST_SIBLING_1_NAME = "_Test Sibling 1 MemberType";
  const TEST_SIBLING_2_NAME = "_Test Sibling 2 MemberType";
  const TEST_SIBLING_3_NAME = "_Test Sibling 3 MemberType";
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await MemberTypeTestHelper.cleanup(TEST_SIBLING_1_NAME);
    await MemberTypeTestHelper.cleanup(TEST_SIBLING_2_NAME);
    await MemberTypeTestHelper.cleanup(TEST_SIBLING_3_NAME);
    console.error = originalConsoleError;
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
    const result = await GetMemberTypeSiblingsTool().handler(
      {
        target: sibling1Builder.getId(),
      },
      { signal: new AbortController().signal }
    );

    // Assert - Verify the siblings are returned
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent target", async () => {
    // Act - Try to get siblings for non-existent item
    const result = await GetMemberTypeSiblingsTool().handler(
      {
        target: BLANK_UUID,
      },
      { signal: new AbortController().signal }
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
