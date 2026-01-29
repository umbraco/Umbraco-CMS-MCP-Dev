import DeleteUserAvatarByIdTool from "../delete/delete-user-avatar-by-id.js";
import UploadUserAvatarByIdTool from "../post/upload-user-avatar-by-id.js";
import { UserBuilder } from "./helpers/user-builder.js";
import { EXAMPLE_IMAGE_PATH } from "@/constants/constants.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import { createReadStream } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import {
  WRITERS_USER_GROUP_ID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  normalizeErrorResponse,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_USER_NAME = "_Test Avatar Delete User";
const TEST_USER_EMAIL = `test-avatar-delete-user-${Math.floor(Math.random() * 10000)}@example.com`;

describe("delete-user-avatar-by-id", () => {
  setupTestEnvironment();
  let userBuilder: UserBuilder;
  let tempFileBuilder: TemporaryFileBuilder;

  afterEach(async () => {
    if (userBuilder) {
      await userBuilder.cleanup();
      userBuilder = undefined!;
    }
    if (tempFileBuilder) {
      await tempFileBuilder.cleanup();
      tempFileBuilder = undefined!;
    }
  });

  it("should delete avatar for user by id", async () => {
    // Arrange
    userBuilder = new UserBuilder()
      .withName(TEST_USER_NAME)
      .withUserName(TEST_USER_EMAIL)
      .withEmail(TEST_USER_EMAIL)
      .withUserGroups([WRITERS_USER_GROUP_ID]);

    await userBuilder.create();
    const userId = userBuilder.getId();

    // First upload an avatar for the user
    const fileStream = createReadStream(
      join(process.cwd(), EXAMPLE_IMAGE_PATH)
    );

    tempFileBuilder = new TemporaryFileBuilder()
      .withId(uuidv4())
      .withFile(fileStream);

    await tempFileBuilder.create();
    const temporaryFileId = tempFileBuilder.getId();

    // Upload avatar first
    await UploadUserAvatarByIdTool.handler({
      id: userId,
      file: { id: temporaryFileId }
    }, createMockRequestHandlerExtra());

    // Mark temp file as consumed - Umbraco deletes it after avatar upload
    tempFileBuilder.markConsumed();

    // Act - Delete the avatar
    const result = await DeleteUserAvatarByIdTool.handler({
      id: userId
    }, createMockRequestHandlerExtra());

    // Assert
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result, userId)).toMatchSnapshot();
  });

  it("should handle non-existent user id", async () => {
    // Act
    const result = await DeleteUserAvatarByIdTool.handler({
      id: "00000000-0000-0000-0000-000000000000"
    }, createMockRequestHandlerExtra());

    // Assert
    expect(result.isError).toBe(true);
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });

  it("should handle user without avatar", async () => {
    // Arrange - Create user without avatar
    userBuilder = new UserBuilder()
      .withName(TEST_USER_NAME)
      .withUserName(TEST_USER_EMAIL)
      .withEmail(TEST_USER_EMAIL)
      .withUserGroups([WRITERS_USER_GROUP_ID]);

    await userBuilder.create();
    const userId = userBuilder.getId();

    // Act - Try to delete avatar from user who doesn't have one
    const result = await DeleteUserAvatarByIdTool.handler({
      id: userId
    }, createMockRequestHandlerExtra());

    // Assert
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result, userId)).toMatchSnapshot();
  });
});
