import { MemberTypeTestHelper } from "./helpers/member-type-helper.js";
import GetMemberTypeRootTool from "../items/get/get-root.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { MemberTypeBuilder } from "./helpers/member-type-builder.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("member-type-tree", () => {
  setupTestEnvironment();

  const TEST_ROOT_NAME = "_Test Root MemberType";

  afterEach(async () => {
    await MemberTypeTestHelper.cleanup(TEST_ROOT_NAME);
  });

  describe("root", () => {
    it("should get root items", async () => {
      // Create a root member type
      await new MemberTypeBuilder()
        .withName(TEST_ROOT_NAME)
        .withIcon("icon-user")
        .create();

      const result = await GetMemberTypeRootTool.handler(
        {
          take: 100,
        } as any,
        createMockRequestHandlerExtra()
      );

      // Normalize and verify response
      const normalizedItems = createSnapshotResult(result);
      expect(normalizedItems).toMatchSnapshot();
    });
  });
}); 