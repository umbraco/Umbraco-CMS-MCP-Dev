import UploadUserCurrentAvatarTool from "../post/upload-user-current-avatar.js";
import { EXAMPLE_IMAGE_PATH } from "@/constants/constants.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import { createReadStream } from "fs";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  normalizeErrorResponse,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("upload-user-current-avatar", () => {
  setupTestEnvironment();
  let tempFileBuilder: TemporaryFileBuilder;

  afterEach(async () => {
    if (tempFileBuilder) {
      await tempFileBuilder.cleanup();
    }
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
    const result = await UploadUserCurrentAvatarTool.handler({
      file: { id: temporaryFileId }
    }, createMockRequestHandlerExtra());

    // Mark temp file as consumed - Umbraco deletes it after avatar upload
    tempFileBuilder.markConsumed();

    // Assert
    expect(result.isError).toBeFalsy();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle non-existent temporary file id", async () => {
    // Act - use non-existent temporary file id
    const result = await UploadUserCurrentAvatarTool.handler({
      file: { id: BLANK_UUID }
    }, createMockRequestHandlerExtra());

    // Assert
    expect(result.isError).toBe(true);
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });
});
