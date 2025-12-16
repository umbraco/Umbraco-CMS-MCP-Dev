import GetMediaByIdReferencedDescendantsTool from "../get/get-media-by-id-referenced-descendants.js";
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

const TEST_MEDIA_NAME = "_Test Media Referenced Descendants";
const TEST_CHILD_MEDIA_NAME = "_Test Child Media Referenced";
const TEST_DOCUMENT_TYPE_NAME = "_Test DocType With Media Desc";
const TEST_DOCUMENT_NAME = "_Test Document With Child Media";

describe("get-media-by-id-referenced-descendants", () => {
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
    await MediaTestHelper.cleanup(TEST_CHILD_MEDIA_NAME);
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_DOCUMENT_TYPE_NAME);
    console.error = originalConsoleError;
  });

  it("should get references to descendant media items", async () => {
    // Create parent media folder
    const parentFolder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withFolderMediaType()
      .create();

    // Create child media
    const childMedia = await new MediaBuilder()
      .withName(TEST_CHILD_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .withParent(parentFolder.getId())
      .create();

    // Create a document type with a media picker property
    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCUMENT_TYPE_NAME)
      .allowAsRoot(true)
      .withProperty("mediaPicker", "Media Picker", MEDIA_PICKER_DATA_TYPE_ID)
      .create();

    // Create document that references the child media
    await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(docTypeBuilder.getId())
      .withValue("mediaPicker", [
        {
          key: childMedia.getId(),
          mediaKey: childMedia.getId()
        }
      ])
      .create();

    // Get references to descendants of the parent folder
    const result = await GetMediaByIdReferencedDescendantsTool.handler(
      {
        id: parentFolder.getId(),
        skip: 0,
        take: 10
      },
      { signal: new AbortController().signal }
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify it returns references to the descendant media items
    const parsed = JSON.parse(result.content[0].text as string);
    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.items.length).toBeGreaterThan(0);
  });

  it.skip("should handle non-existent media ID", async () => {
    const result = await GetMediaByIdReferencedDescendantsTool.handler(
      {
        id: BLANK_UUID,
        skip: 0,
        take: 10
      },
      { signal: new AbortController().signal }
    );

    expect(result).toMatchSnapshot();
  });

  it("should return empty when media folder has no referenced descendants", async () => {
    // Create parent media folder with descendants that are NOT referenced
    const parentFolder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withFolderMediaType()
      .create();

    // Create child media but don't reference it in any documents
    await new MediaBuilder()
      .withName(TEST_CHILD_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .withParent(parentFolder.getId())
      .create();

    const result = await GetMediaByIdReferencedDescendantsTool.handler(
      {
        id: parentFolder.getId(),
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

  it("should handle media with no descendants", async () => {
    // Create a single media item (not a folder) - should return empty
    const singleMedia = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    const result = await GetMediaByIdReferencedDescendantsTool.handler(
      {
        id: singleMedia.getId(),
        skip: 0,
        take: 10
      },
      { signal: new AbortController().signal }
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify it returns empty results since there are no descendants
    const parsed = JSON.parse(result.content[0].text as string);
    expect(parsed.total).toBe(0);
    expect(parsed.items).toHaveLength(0);
  });
});