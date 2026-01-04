import { MediaTypeTestHelper } from "./helpers/media-type-helper.js";
import { MediaTypeFolderTestHelper } from "./helpers/media-type-folder-helper.js";
import CreateMediaTypeTool from "../post/create-media-type.js";
import {
  createSnapshotResult,
  normalizeErrorResponse,
} from "@/test-helpers/create-snapshot-result.js";
import { MediaTypeBuilder } from "./helpers/media-type-builder.js";
import { MediaTypeFolderBuilder } from "./helpers/media-type-folder-builder.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("create-media-type", () => {
  setupTestEnvironment();

  const TEST_MEDIA_TYPE_NAME = "_Test Media Type";
  const TEST_FOLDER_NAME = "_Test Media Type Create Folder";
  const TEST_MEDIA_TYPE_WITH_PARENT_NAME = "_Test Media Type With Parent";

  afterEach(async () => {
    await MediaTypeTestHelper.cleanup(TEST_MEDIA_TYPE_NAME);
    await MediaTypeTestHelper.cleanup(TEST_MEDIA_TYPE_WITH_PARENT_NAME);
    await MediaTypeFolderTestHelper.cleanup(TEST_FOLDER_NAME);
  });

  it("should create a media type", async () => {
    const builder = new MediaTypeBuilder()
      .withName(TEST_MEDIA_TYPE_NAME)
      .withDescription("Test media type description")
      .withAllowedAsRoot(true);

    const result = await CreateMediaTypeTool.handler(
      builder.build() as any,
      createMockRequestHandlerExtra()
    );

    // Normalize and verify response
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();

    // Verify the media type was created
    const items = await MediaTypeTestHelper.findMediaTypes(
      TEST_MEDIA_TYPE_NAME
    );
    expect(items.length).toBe(1);
    expect(items[0].name).toBe(TEST_MEDIA_TYPE_NAME);
  });

  it("should handle invalid media type data", async () => {
    const invalidModel = {
      name: TEST_MEDIA_TYPE_NAME,
      // Missing required fields
    };

    const result = await CreateMediaTypeTool.handler(
      invalidModel as any,
      createMockRequestHandlerExtra()
    );

    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });

  it("should create a media type with parent folder", async () => {
    // Arrange: Create parent folder
    const folderBuilder = await new MediaTypeFolderBuilder()
      .withName(TEST_FOLDER_NAME)
      .create();

    // Arrange: Create media type with flattened parentId for tool
    const result = await CreateMediaTypeTool.handler({
      alias: TEST_MEDIA_TYPE_WITH_PARENT_NAME.toLowerCase().replace(/\s+/g, ""),
      name: TEST_MEDIA_TYPE_WITH_PARENT_NAME,
      description: "Test media type in folder",
      icon: "icon-folder",
      allowedAsRoot: false,
      variesByCulture: false,
      variesBySegment: false,
      isElement: false,
      properties: [],
      containers: [],
      allowedMediaTypes: [],
      compositions: [],
      parentId: folderBuilder.getId()  // Flattened parent ID
    } as any, createMockRequestHandlerExtra());

    // Assert: Verify the handler response
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();

    // Assert: Verify the created item exists with correct parent
    const items = await MediaTypeTestHelper.findMediaTypes(
      TEST_MEDIA_TYPE_WITH_PARENT_NAME
    );
    expect(items.length).toBe(1);
    expect(items[0].name).toBe(TEST_MEDIA_TYPE_WITH_PARENT_NAME);
    expect(items[0].parent!.id).toBe(folderBuilder.getId());
  });
});
