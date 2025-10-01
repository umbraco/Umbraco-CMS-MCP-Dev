import UploadUserCurrentAvatarTool from "../post/upload-user-current-avatar.js";
import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { EXAMPLE_IMAGE_PATH, BLANK_UUID } from "@/constants/constants.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import { jest } from "@jest/globals";
import { createReadStream } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

describe("upload-user-current-avatar", () => {
  let originalConsoleError: typeof console.error;
  let tempFileBuilder: TemporaryFileBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    if (tempFileBuilder) {
      await tempFileBuilder.cleanup();
    }
    console.error = originalConsoleError;
  });

  it("should upload avatar for current user", async () => {
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
    const result = await UploadUserCurrentAvatarTool().handler({
      file: { id: temporaryFileId }
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle non-existent temporary file id", async () => {
    // Act - use non-existent temporary file id
    const result = await UploadUserCurrentAvatarTool().handler({
      file: { id: BLANK_UUID }
    }, { signal: new AbortController().signal });

    // Assert
    const normalizedResult = normalizeErrorResponse(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});