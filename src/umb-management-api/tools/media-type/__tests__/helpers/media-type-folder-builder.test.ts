import { MediaTypeFolderBuilder } from "./media-type-folder-builder.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("MediaTypeFolderBuilder", () => {
  setupTestEnvironment();

  let builder: MediaTypeFolderBuilder;
  let parentBuilder: MediaTypeFolderBuilder;

  const TEST_MEDIA_TYPE_FOLDER_NAME = "_Test Media Type Folder";
  const TEST_MEDIA_TYPE_PARENT_FOLDER_NAME = "_Test Media Type Parent Folder";
  const TEST_MEDIA_TYPE_CHILD_FOLDER_NAME = "_Test Media Type Child Folder";

  beforeEach(() => {
    builder = new MediaTypeFolderBuilder();
    parentBuilder = new MediaTypeFolderBuilder();
  });

  afterEach(async () => {
    await builder.cleanup();
    await parentBuilder.cleanup();
  });

  it("should create a folder with name", async () => {
    await builder
      .withName(TEST_MEDIA_TYPE_FOLDER_NAME)
      .create();

    expect(builder.getId()).toBeDefined();
    expect(await builder.verify()).toBe(true);
  });

  it("should throw error when trying to get ID before creation", () => {
    expect(() => builder.getId()).toThrow("No media type folder has been created yet");
  });

  it("should throw error when trying to verify before creation", async () => {
    await expect(builder.verify()).rejects.toThrow("No media type folder has been created yet");
  });

  it("should create a folder with parent", async () => {
    // First create a parent folder
    
    await parentBuilder
      .withName(TEST_MEDIA_TYPE_PARENT_FOLDER_NAME)
      .create();
    const parentId = parentBuilder.getId();

    // Then create a child folder
    await builder
      .withName(TEST_MEDIA_TYPE_CHILD_FOLDER_NAME)
      .withParentId(parentId)
      .create();

    expect(builder.getId()).toBeDefined();
    expect(await builder.verify()).toBe(true);

    // Clean up parent folder
    await parentBuilder.cleanup();
  });
}); 