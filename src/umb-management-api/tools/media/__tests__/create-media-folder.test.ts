import CreateMediaFolderTool from "../post/create-media-folder.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_Test Folder Created";
const TEST_NESTED_FOLDER_NAME = "_Test Nested Folder";
const TEST_PARENT_FOLDER_NAME = "_Test Parent Folder";

describe("create-media-folder", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await MediaTestHelper.cleanup(TEST_FOLDER_NAME);
    await MediaTestHelper.cleanup(TEST_NESTED_FOLDER_NAME);
    await MediaTestHelper.cleanup(TEST_PARENT_FOLDER_NAME);
  });

  it("should create a folder at root level", async () => {
    const result = await CreateMediaFolderTool.handler(
      { name: TEST_FOLDER_NAME } as any,
      createMockRequestHandlerExtra()
    );
    // Normalize the dynamic ID before snapshot
    expect(createSnapshotResult(result)).toMatchSnapshot();
    const found = await MediaTestHelper.findMedia(TEST_FOLDER_NAME);
    expect(found).toBeDefined();
    expect(MediaTestHelper.getNameFromItem(found)).toBe(TEST_FOLDER_NAME);
  });

  it("should create a folder inside another folder", async () => {
    const parentBuilder = await new MediaBuilder()
      .withName(TEST_PARENT_FOLDER_NAME)
      .withFolderMediaType()
      .create();

    const result = await CreateMediaFolderTool.handler(
      { name: TEST_NESTED_FOLDER_NAME, parentId: parentBuilder.getId() } as any,
      createMockRequestHandlerExtra()
    );
    // Normalize the dynamic ID before snapshot
    expect(createSnapshotResult(result)).toMatchSnapshot();
    const children = await parentBuilder.getChildren();
    const nestedFolder = children.items.find(
      (item) => MediaTestHelper.getNameFromItem(item) === TEST_NESTED_FOLDER_NAME
    );
    expect(nestedFolder).toBeDefined();
  });

  it("should handle non-existent parent ID", async () => {
    const result = await CreateMediaFolderTool.handler(
      { name: TEST_FOLDER_NAME, parentId: BLANK_UUID } as any,
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
    expect(result.isError).toBe(true);
  });
});
