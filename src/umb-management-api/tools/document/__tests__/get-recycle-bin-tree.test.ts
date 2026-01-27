import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import GetRecycleBinDocumentRootTool from "../items/get/get-recycle-bin-root.js";
import GetRecycleBinDocumentChildrenTool from "../items/get/get-recycle-bin-children.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("recycle-bin-tree", () => {
  setupTestEnvironment();

  const TEST_RECYCLE_BIN_NAME = "_Test RecycleBin Root";
  const TEST_RECYCLE_BIN_CHILD_NAME = "_Test RecycleBin Child";

  beforeEach(async () => {
    await DocumentTestHelper.emptyRecycleBin();
  });

  afterEach(async () => {
    await DocumentTestHelper.emptyRecycleBin();
  });

  describe("root", () => {
    it("should get recycle bin root items", async () => {
      // Create and move a document to the recycle bin
      const builder = await new DocumentBuilder()
        .withName(TEST_RECYCLE_BIN_NAME)
        .withRootDocumentType()
        .create();
      await builder.moveToRecycleBin();

      const result = await GetRecycleBinDocumentRootTool.handler(
        { skip: undefined, take: 100 },
        createMockRequestHandlerExtra()
      );
      const normalizedItems = createSnapshotResult(result);
      expect(normalizedItems).toMatchSnapshot();
    });
  });

  describe("children", () => {
    it("should get recycle bin child items", async () => {
      // Create parent and child, move both to recycle bin
      const parentBuilder = await new DocumentBuilder()
        .withName(TEST_RECYCLE_BIN_NAME)
        .withRootDocumentType()
        .create();
      const childBuilder = await new DocumentBuilder()
        .withName(TEST_RECYCLE_BIN_CHILD_NAME)
        .withContentDocumentType()
        .withParent(parentBuilder.getId())
        .create();
      await childBuilder.moveToRecycleBin();
      await parentBuilder.moveToRecycleBin();

      // Find parent in recycle bin to get its id
      const parentInBin = await DocumentTestHelper.findDocumentInRecycleBin(
        TEST_RECYCLE_BIN_NAME
      );
      expect(parentInBin).toBeDefined();

      const result = await GetRecycleBinDocumentChildrenTool.handler(
        {
          parentId: parentInBin!.id,
          skip: undefined,
          take: 100,
        },
        createMockRequestHandlerExtra()
      );
      const normalizedItems = createSnapshotResult(result);
      expect(normalizedItems).toMatchSnapshot();
    });

    it("should handle non-existent parent in recycle bin", async () => {
      const result = await GetRecycleBinDocumentChildrenTool.handler(
        {
          parentId: BLANK_UUID,
          skip: undefined,
          take: 100,
        },
        createMockRequestHandlerExtra()
      );
      expect(result).toMatchSnapshot();
    });
  });
});
