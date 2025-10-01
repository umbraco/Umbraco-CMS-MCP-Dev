import GetMediaByIdReferencedByTool from "../get/get-media-by-id-referenced-by.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { BLANK_UUID, MEDIA_PICKER_DATA_TYPE_ID } from "@/constants/constants.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DocumentBuilder } from "../../document/__tests__/helpers/document-builder.js";
import { DocumentTestHelper } from "../../document/__tests__/helpers/document-test-helper.js";

const TEST_MEDIA_NAME = "_Test Media Referenced By";
const TEST_REFERENCING_MEDIA_NAME = "_Test Referencing Media";
const TEST_DOCUMENT_TYPE_NAME = "_Test DocType With Media Ref";
const TEST_DOCUMENT_NAME = "_Test Document With Media Ref";

describe("get-media-by-id-referenced-by", () => {
  let originalConsoleError: typeof console.error;
  let tempFileBuilder: TemporaryFileBuilder;

  beforeEach(async () => {
    originalConsoleError = console.error;
    console.error = jest.fn();

    tempFileBuilder = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();
  });

  afterEach(async () => {
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME);
    await MediaTestHelper.cleanup(TEST_REFERENCING_MEDIA_NAME);
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_DOCUMENT_TYPE_NAME);
    console.error = originalConsoleError;
  });

  it("should get documents that reference a specific media item", async () => {
    // Create a media item that will be referenced
    const referencedMedia = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    // Create a document type with a media picker property
    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCUMENT_TYPE_NAME)
      .allowAsRoot(true)
      .withProperty("mediaPicker", "Media Picker", MEDIA_PICKER_DATA_TYPE_ID)
      .create();

    // Create a document that references the media
    await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(docTypeBuilder.getId())
      .withValue("mediaPicker", [
        {
          key: referencedMedia.getId(),
          mediaKey: referencedMedia.getId()
        }
      ])
      .create();

    // Get items that reference the media
    const result = await GetMediaByIdReferencedByTool().handler(
      {
        id: referencedMedia.getId(),
        skip: 0,
        take: 10
      },
      { signal: new AbortController().signal }
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify it returns the referencing document
    const parsed = JSON.parse(result.content[0].text as string);
    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.items.length).toBeGreaterThan(0);
  });

  it("should handle non-existent media ID", async () => {
    const result = await GetMediaByIdReferencedByTool().handler(
      {
        id: BLANK_UUID,
        skip: 0,
        take: 10
      },
      { signal: new AbortController().signal }
    );

    expect(result).toMatchSnapshot();
  });

  it("should return empty result when media has no references", async () => {
    // Create a media item that is NOT referenced by anything
    const unreferencedMedia = await new MediaBuilder()
      .withName(TEST_REFERENCING_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    const result = await GetMediaByIdReferencedByTool().handler(
      {
        id: unreferencedMedia.getId(),
        skip: 0,
        take: 10
      },
      { signal: new AbortController().signal }
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify it returns empty results
    const parsed = JSON.parse(result.content[0].text as string);
    expect(parsed.total).toBe(0);
    expect(parsed.items).toHaveLength(0);
  });

});