import ValidateMediaUpdateTool from "../put/validate-media.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import { normalizeErrorResponse, createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";

const TEST_MEDIA_NAME = "_Test ValidateMediaUpdate";
const UPDATED_MEDIA_NAME = "_Test ValidateMediaUpdate Updated";

describe("validate-media-update", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(async () => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME);
    await MediaTestHelper.cleanup(UPDATED_MEDIA_NAME);
  });

  it("should validate a valid media update", async () => {
    // Arrange: Create a media item to validate update against
    const tempFileBuilder1 = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();

    const builder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder1.getId())
      .create();

    // Create a new temporary file for validation (since first one was consumed)
    const tempFileBuilder2 = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();

    // Create validation model for update
    const updateModel = new MediaBuilder()
      .withName(UPDATED_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder2.getId())
      .build();

    // Act: Validate the media update
    const result = await ValidateMediaUpdateTool().handler(
      {
        id: builder.getId(),
        data: updateModel,
      },
      { signal: new AbortController().signal }
    );

    // Assert: Verify the handler response using snapshot
    expect(result).toMatchSnapshot();
  });

  it("should handle validation for non-existent media", async () => {
    // Arrange: Create validation model
    const tempFileBuilder = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();

    const updateModel = new MediaBuilder()
      .withName(UPDATED_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .build();

    // Act: Try to validate update for non-existent media
    const result = await ValidateMediaUpdateTool().handler(
      {
        id: BLANK_UUID,
        data: updateModel,
      },
      { signal: new AbortController().signal }
    );

    // Assert: Verify the error response using snapshot
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });
});
