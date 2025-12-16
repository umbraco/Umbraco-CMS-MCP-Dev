import GetRecycleBinMediaReferencedByTool from "../get/get-recycle-bin-media-referenced-by.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { MEDIA_PICKER_DATA_TYPE_ID } from "@/constants/constants.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DocumentBuilder } from "../../document/__tests__/helpers/document-builder.js";
import { DocumentTestHelper } from "../../document/__tests__/helpers/document-test-helper.js";
import MoveMediaToRecycleBinTool from "../put/move-to-recycle-bin.js";

const TEST_MEDIA_NAME = "_Test Media Recycle Ref";
const TEST_MEDIA_NAME_2 = "_Test Media Recycle Ref 2";
const TEST_DOCUMENT_TYPE_NAME = "_Test DocType Recycle Media";
const TEST_DOCUMENT_NAME = "_Test Document Recycle Media";
const TEST_DOCUMENT_NAME_2 = "_Test Document Recycle Media 2";

describe("get-recycle-bin-media-referenced-by", () => {
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
    // Clean up in parallel to speed up tests
    await Promise.all([
      MediaTestHelper.cleanup(TEST_MEDIA_NAME),
      MediaTestHelper.cleanup(TEST_MEDIA_NAME_2),
      DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME),
      DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME_2),
      DocumentTypeTestHelper.cleanup(TEST_DOCUMENT_TYPE_NAME)
    ]);
    console.error = originalConsoleError;
  }, 15000); // Increase timeout for cleanup

  it("should return empty when no deleted media has references", async () => {
    const result = await GetRecycleBinMediaReferencedByTool.handler(
      {
        skip: 0,
        take: 10
      },
      { signal: new AbortController().signal }
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify empty results
    const parsed = JSON.parse(result.content[0].text as string);
    expect(parsed.total).toBe(0);
    expect(parsed.items).toHaveLength(0);
  });

  it("should detect references to deleted media items", async () => {
    // Create media that will be referenced
    const mediaBuilder = await new MediaBuilder()
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

    // Create documents that reference the media
    await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(docTypeBuilder.getId())
      .withValue("mediaPicker", [
        {
          key: mediaBuilder.getId(),
          mediaKey: mediaBuilder.getId()
        }
      ])
      .create();

    await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME_2)
      .withDocumentType(docTypeBuilder.getId())
      .withValue("mediaPicker", [
        {
          key: mediaBuilder.getId(),
          mediaKey: mediaBuilder.getId()
        }
      ])
      .create();

    // Move media to recycle bin
    await MoveMediaToRecycleBinTool.handler(
      {
        id: mediaBuilder.getId()
      },
      { signal: new AbortController().signal }
    );

    // Check for references to deleted media
    const result = await GetRecycleBinMediaReferencedByTool.handler(
      {
        skip: 0,
        take: 10
      },
      { signal: new AbortController().signal }
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify references are detected
    const parsed = JSON.parse(result.content[0].text as string);
    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.items.length).toBeGreaterThan(0);
  });

  it("should handle pagination parameters correctly", async () => {
    // Simple pagination test - just test the API accepts the parameters
    const result = await GetRecycleBinMediaReferencedByTool.handler(
      {
        skip: 5,
        take: 5
      },
      { signal: new AbortController().signal }
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Should return valid result structure
    const parsed = JSON.parse(result.content[0].text as string);
    expect(parsed).toHaveProperty('total');
    expect(parsed).toHaveProperty('items');
    expect(Array.isArray(parsed.items)).toBe(true);
  });

  it("should handle default pagination parameters", async () => {
    // Test with only required parameters
    const result = await GetRecycleBinMediaReferencedByTool.handler(
      {
        take: 20
      },
      { signal: new AbortController().signal }
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Should return valid result structure
    const parsed = JSON.parse(result.content[0].text as string);
    expect(parsed).toHaveProperty('total');
    expect(parsed).toHaveProperty('items');
  });
});