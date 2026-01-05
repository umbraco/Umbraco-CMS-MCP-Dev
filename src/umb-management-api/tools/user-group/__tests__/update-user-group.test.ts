import UpdateUserGroupTool from "../put/update-user-group.js";
import { UserGroupBuilder } from "./helpers/user-group-builder.js";
import { UserGroupTestHelper } from "./helpers/user-group-helper.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_GROUP_NAME = "_Test User Group Update";
const UPDATED_GROUP_NAME = "_Updated User Group";
const NON_EXISTENT_GROUP_NAME = "_Non Existent User Group";

describe("update-user-group", () => {
  setupTestEnvironment();
  let builder: UserGroupBuilder;

  beforeEach(() => {
    builder = new UserGroupBuilder();
  });

  afterEach(async () => {
    await builder.cleanup();
    await UserGroupTestHelper.cleanup(UPDATED_GROUP_NAME);
  });

  it("should update a user group", async () => {
    await builder.withName(TEST_GROUP_NAME).create();
    const result = await UpdateUserGroupTool.handler(
      {
        id: builder.getId(),
        data: {
          name: UPDATED_GROUP_NAME,
          alias: UPDATED_GROUP_NAME.toLowerCase().replace(/\s+/g, "-"),
          sections: ["content"],
          languages: [],
          hasAccessToAllLanguages: true,
          documentRootAccess: false,
          mediaRootAccess: false,
          fallbackPermissions: [],
          permissions: [],
        },
      },
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();
    const items = await UserGroupTestHelper.findUserGroups(UPDATED_GROUP_NAME);
    expect(createSnapshotResult({ structuredContent: { items } })).toMatchSnapshot();
  });

  it("should handle non-existent user group", async () => {
    const result = await UpdateUserGroupTool.handler(
      {
        id: BLANK_UUID,
        data: {
          name: NON_EXISTENT_GROUP_NAME,
          alias: NON_EXISTENT_GROUP_NAME.toLowerCase().replace(/\s+/g, "-"),
          sections: ["content"],
          languages: [],
          hasAccessToAllLanguages: true,
          documentRootAccess: false,
          mediaRootAccess: false,
          fallbackPermissions: [],
          permissions: [],
        },
      },
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
