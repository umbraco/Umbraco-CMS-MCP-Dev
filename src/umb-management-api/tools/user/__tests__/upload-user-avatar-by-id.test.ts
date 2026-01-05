import UploadUserAvatarByIdTool from "../post/upload-user-avatar-by-id.js";
import { UserBuilder } from "./helpers/user-builder.js";
import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { WRITERS_USER_GROUP_ID, EXAMPLE_IMAGE_PATH, BLANK_UUID } from "@/constants/constants.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import { createReadStream } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

const TEST_USER_NAME = "_Test Avatar User";
const TEST_USER_EMAIL = `test-avatar-user-${Math.floor(Math.random() * 10000)}@example.com`;

describe("upload-user-avatar-by-id", () => {
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

  it("should upload avatar for user by id", async () => {
    // Arrange
    userBuilder = new UserBuilder()
      .withName(TEST_USER_NAME)
      .withUserName(TEST_USER_EMAIL)
      .withEmail(TEST_USER_EMAIL)
      .withUserGroups([WRITERS_USER_GROUP_ID]);

    await userBuilder.create();
    const userId = userBuilder.getId();

    // Create a temporary file first for the avatar
    const fileStream = createReadStream(
      join(process.cwd(), EXAMPLE_IMAGE_PATH)
    );

    tempFileBuilder = new TemporaryFileBuilder()
      .withId(uuidv4())
      .withFile(fileStream);

    await tempFileBuilder.create();
    const temporaryFileId = tempFileBuilder.getId();

    // Act
    const result = await UploadUserAvatarByIdTool.handler({
      id: userId,
      file: { id: temporaryFileId }
    }, createMockRequestHandlerExtra());

    // Mark temp file as consumed - Umbraco deletes it after avatar upload
    tempFileBuilder.markConsumed();

    // Assert
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result, userId)).toMatchSnapshot();
  });

  it("should handle non-existent user id", async () => {
    // Arrange
    const fileStream = createReadStream(
      join(process.cwd(), EXAMPLE_IMAGE_PATH)
    );

    tempFileBuilder = new TemporaryFileBuilder()
      .withId(uuidv4())
      .withFile(fileStream);

    await tempFileBuilder.create();
    const temporaryFileId = tempFileBuilder.getId();

    // Act
    const result = await UploadUserAvatarByIdTool.handler({
      id: BLANK_UUID,
      file: { id: temporaryFileId }
    }, createMockRequestHandlerExtra());

    // Mark temp file as consumed - Umbraco processes it even when operation fails
    tempFileBuilder.markConsumed();

    // Assert
    expect(result.isError).toBe(true);
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });

  it("should handle non-existent temporary file id", async () => {
    // Arrange
    userBuilder = new UserBuilder()
      .withName(TEST_USER_NAME)
      .withUserName(TEST_USER_EMAIL)
      .withEmail(TEST_USER_EMAIL)
      .withUserGroups([WRITERS_USER_GROUP_ID]);

    await userBuilder.create();
    const userId = userBuilder.getId();

    // Act - use non-existent temporary file id
    const result = await UploadUserAvatarByIdTool.handler({
      id: userId,
      file: { id: BLANK_UUID }
    }, createMockRequestHandlerExtra());

    // Assert
    expect(result.isError).toBe(true);
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });
});
