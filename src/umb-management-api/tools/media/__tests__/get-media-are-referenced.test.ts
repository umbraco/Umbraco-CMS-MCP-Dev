import GetMediaAreReferencedTool from "../get/get-media-are-referenced.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { BLANK_UUID, MEDIA_PICKER_DATA_TYPE_ID } from "@/constants/constants.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DocumentBuilder } from "../../document/__tests__/helpers/document-builder.js";
import { DocumentTestHelper } from "../../document/__tests__/helpers/document-test-helper.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_MEDIA_NAME = "_Test Media Are Referenced";
const TEST_MEDIA_NAME_1 = "_Test Media Are Referenced1";
const TEST_MEDIA_NAME_2 = "_Test Media Are Referenced2";
const TEST_DOCUMENT_TYPE_NAME = "_Test DocType With Media";
const TEST_DOCUMENT_NAME = "_Test Document With Media";
const TEST_DOCUMENT_NAME_2 = "_Test Document With Media 2";

describe("get-media-are-referenced", () => {
  setupTestEnvironment();
  let tempFileBuilder: TemporaryFileBuilder;
  let tempFileBuilder2: TemporaryFileBuilder;

  beforeEach(async () => {
    tempFileBuilder = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();

    tempFileBuilder2 = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();
  });

  afterEach(async () => {
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME);
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME_1);
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME_2);
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME_2);
    await DocumentTypeTestHelper.cleanup(TEST_DOCUMENT_TYPE_NAME);
  });

  it("should return empty when media is not referenced", async () => {
    // Create a media item that is NOT referenced
    const builder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    const result = await GetMediaAreReferencedTool.handler(
      {
        id: [builder.getId()],
        skip: 0,
        take: 10
      } as any,
      createMockRequestHandlerExtra()
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Validate response against tool's outputSchema and verify it returns empty results
    const parsed = validateToolResponse(GetMediaAreReferencedTool, result);
    expect(parsed.total).toBe(0);
    expect(parsed.items).toHaveLength(0);
  });

  it("should detect mixed scenario - one referenced, one not referenced", async () => {
    // Create two media items
    const referencedMedia = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME_1)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    const unreferencedMedia = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME_2)
      .withImageMediaType()
      .withImageValue(tempFileBuilder2.getId())
      .create();

    // Create a document type with a media picker
    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCUMENT_TYPE_NAME)
      .allowAsRoot(true)
      .withProperty("mediaPicker", "Media Picker", MEDIA_PICKER_DATA_TYPE_ID)
      .create();

    // Create a document that references only the first media
    await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME_2)
      .withDocumentType(docTypeBuilder.getId())
      .withValue("mediaPicker", [
        {
          key: referencedMedia.getId(),
          mediaKey: referencedMedia.getId()
        }
      ])
      .create();

    // Check both media items
    const result = await GetMediaAreReferencedTool.handler(
      {
        id: [referencedMedia.getId(), unreferencedMedia.getId()],
        skip: 0,
        take: 10
      } as any,
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's outputSchema
    const parsed = validateToolResponse(GetMediaAreReferencedTool, result);
    // Should return only the referenced media
    expect(parsed.total).toBe(1);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].id).toBe(referencedMedia.getId());
  });

  it("should handle non-existent media IDs", async () => {
    const result = await GetMediaAreReferencedTool.handler(
      {
        id: [BLANK_UUID],
        skip: 0,
        take: 10
      } as any,
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });

  it("should detect when media is referenced by a document", async () => {
    // Create a media item
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

    // Create a document that references the media
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

    // Check if the media is now referenced
    const result = await GetMediaAreReferencedTool.handler(
      {
        id: [mediaBuilder.getId()],
        skip: 0,
        take: 10
      } as any,
      createMockRequestHandlerExtra()
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Validate response against tool's outputSchema and verify it returns the reference
    const parsed = validateToolResponse(GetMediaAreReferencedTool, result);
    expect(parsed.total).toBeGreaterThan(0);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].id).toBe(mediaBuilder.getId());
  });
});
