import { DataTypeTestHelper } from "./helpers/data-type-test-helper.js";
import CreateDataTypeFolderTool from "../folders/post/create-folder.js";
import DeleteDataTypeFolderTool from "../folders/delete/delete-folder.js";
import UpdateDataTypeFolderTool from "../folders/put/update-folder.js";
import { DataTypeFolderBuilder } from "./helpers/data-type-folder-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateErrorResult,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME = "_Test DataType Folder";
const TEST_PARENT_FOLDER_NAME = "_Test Parent DataType Folder";
const UPDATE_FOLDER_NAME = "_Update DataType Folder Name";
const UPDATED_FOLDER_NAME = "_Updated DataType Folder Name";

describe("data-type-folder", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DataTypeTestHelper.cleanup(TEST_FOLDER_NAME);
    await DataTypeTestHelper.cleanup(TEST_PARENT_FOLDER_NAME);
    await DataTypeTestHelper.cleanup(UPDATE_FOLDER_NAME);
    await DataTypeTestHelper.cleanup(UPDATED_FOLDER_NAME);
  });

  describe("create", () => {
    it("should create a folder", async () => {
      // Act - Create the folder
      const result = await CreateDataTypeFolderTool.handler(
        { name: TEST_FOLDER_NAME } as any,
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result)).toMatchSnapshot();

      // Assert - Verify folder exists
      const found = await DataTypeTestHelper.findDataType(TEST_FOLDER_NAME);
      expect(found).toBeDefined();
      expect(found!.isFolder).toBe(true);
    });

    it("should create a folder with parent", async () => {
      // Arrange - Create parent folder
      const parentBuilder = await new DataTypeFolderBuilder(
        TEST_PARENT_FOLDER_NAME
      ).create();

      // Act - Create child folder
      const result = await CreateDataTypeFolderTool.handler(
        { name: TEST_FOLDER_NAME, parent: { id: parentBuilder.getId() } } as any,
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result)).toMatchSnapshot();

      // Assert - Verify folder exists under parent
      const found = await DataTypeTestHelper.findDataType(TEST_FOLDER_NAME);
      expect(found).toBeDefined();
      expect(found!.isFolder).toBe(true);
    });
  });

  describe("update", () => {
    it("should update a folder name", async () => {
      // Arrange - Create folder to update
      const builder = await new DataTypeFolderBuilder(
        UPDATE_FOLDER_NAME
      ).create();

      // Act - Update the folder
      const result = await UpdateDataTypeFolderTool.handler(
        {
          id: builder.getId(),
          data: {
            name: UPDATED_FOLDER_NAME,
          },
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(result).toMatchSnapshot();

      // Assert - Verify folder was updated
      const found = await DataTypeTestHelper.findDataType(UPDATED_FOLDER_NAME);
      expect(found).toBeDefined();
      expect(found!.name).toBe(UPDATED_FOLDER_NAME);
    });

    it("should handle non-existent folder", async () => {
      // Act - Try to update non-existent folder
      const result = await UpdateDataTypeFolderTool.handler(
        {
          id: BLANK_UUID,
          data: {
            name: UPDATED_FOLDER_NAME,
          },
        },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the error response
      validateErrorResult(result);
      expect(result).toMatchSnapshot();
    });
  });

  describe("delete", () => {
    it("should delete a folder", async () => {
      // Arrange - Create folder to delete
      const builder = await new DataTypeFolderBuilder(
        TEST_FOLDER_NAME
      ).create();

      // Act - Delete the folder
      const result = await DeleteDataTypeFolderTool.handler(
        { id: builder.getId() },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the handler response
      expect(createSnapshotResult(result)).toMatchSnapshot();

      // Assert - Verify folder was deleted
      const found = await DataTypeTestHelper.findDataType(TEST_FOLDER_NAME);
      expect(found).toBeUndefined();
    });

    it("should handle non-existent folder", async () => {
      // Act - Try to delete non-existent folder
      const result = await DeleteDataTypeFolderTool.handler(
        { id: BLANK_UUID },
        createMockRequestHandlerExtra()
      );

      // Assert - Verify the error response
      validateErrorResult(result);
      expect(result).toMatchSnapshot();
    });
  });
});
