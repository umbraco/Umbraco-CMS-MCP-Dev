import UploadUserAvatarByIdTool from "../post/upload-user-avatar-by-id.js";
import { UserBuilder } from "./helpers/user-builder.js";
import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { WRITERS_USER_GROUP_ID, EXAMPLE_IMAGE_PATH, BLANK_UUID } from "@/constants/constants.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import { jest } from "@jest/globals";
import { createReadStream } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

const TEST_USER_NAME = "_Test Avatar User";
const TEST_USER_EMAIL = `test-avatar-user-${Math.floor(Math.random() * 10000)}@example.com`;

describe("upload-user-avatar-by-id", () => {
  let originalConsoleError: typeof console.error;
  let userBuilder: UserBuilder;
  let tempFileBuilder: TemporaryFileBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    if (userBuilder) {
      await userBuilder.cleanup();
    }
    if (tempFileBuilder) {
      await tempFileBuilder.cleanup();
    }
    console.error = originalConsoleError;
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
    const result = await UploadUserAvatarByIdTool().handler({
      id: userId,
      file: { id: temporaryFileId }
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result, userId);
    expect(normalizedResult).toMatchSnapshot();

    // Verify the upload was successful by checking if result indicates success
    expect(result.content[0].text).toBeDefined();
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
    const result = await UploadUserAvatarByIdTool().handler({
      id: BLANK_UUID,
      file: { id: temporaryFileId }
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = normalizeErrorResponse(result);
    expect(normalizedResult).toMatchSnapshot();
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
    const result = await UploadUserAvatarByIdTool().handler({
      id: userId,
      file: { id: BLANK_UUID }
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = normalizeErrorResponse(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});