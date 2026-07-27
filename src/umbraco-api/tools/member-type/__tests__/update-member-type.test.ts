import { MemberTypeTestHelper } from "./helpers/member-type-helper.js";
import UpdateMemberTypeTool from "../put/update-member-type.js";
import { MemberTypeBuilder } from "./helpers/member-type-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_MEMBER_TYPE_NAME = "_Test Member Type Update";
const UPDATED_MEMBER_TYPE_NAME = "_Updated Member Type";
const NON_EXISTENT_MEMBER_TYPE_NAME = "_Non Existent Member Type";

describe("update-member-type", () => {
  setupTestEnvironment();

  let builder: MemberTypeBuilder;

  beforeEach(() => {
    builder = new MemberTypeBuilder();
  });

  afterEach(async () => {
    await builder.cleanup();
    await MemberTypeTestHelper.cleanup(UPDATED_MEMBER_TYPE_NAME);
  });

  it("should update a member type", async () => {
    await builder.withName(TEST_MEMBER_TYPE_NAME).create();

    const model = builder.withName(UPDATED_MEMBER_TYPE_NAME).build();

    const result = await UpdateMemberTypeTool.handler(
      {
        id: builder.getId(),
        data: model,
      },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
    const items = await MemberTypeTestHelper.findMemberTypes(
      UPDATED_MEMBER_TYPE_NAME
    );
    items[0].id = BLANK_UUID;
    expect(items).toMatchSnapshot();
  });

  it("should handle non-existent member type", async () => {
    const model = builder
      .withName(NON_EXISTENT_MEMBER_TYPE_NAME)
      .withAllowedAsRoot(true)
      .withIsElement(false)
      .build();

    const result = await UpdateMemberTypeTool.handler(
      {
        id: BLANK_UUID,
        data: model,
      },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
  });
});
