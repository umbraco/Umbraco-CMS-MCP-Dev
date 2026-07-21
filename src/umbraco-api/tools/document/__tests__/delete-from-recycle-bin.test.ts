import DeleteFromRecycleBinTool from "../delete/delete-from-recycle-bin.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("delete-from-recycle-bin", () => {
  setupTestEnvironment();

  const TEST_RECYCLE_BIN_NAME = "_Test DeleteFromRecycleBinTool";

  beforeEach(async () => {
    await DocumentTestHelper.emptyRecycleBin();
  });

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_RECYCLE_BIN_NAME);
  });

  it("should delete a document from the recycle bin by id", async () => {
    // Create and move a document to the recycle bin
    const builder = await new DocumentBuilder()
      .withName(TEST_RECYCLE_BIN_NAME)
      .withRootDocumentType()
      .create();
    await builder.moveToRecycleBin();

    // Should be found in recycle bin
    let found = await DocumentTestHelper.findDocumentInRecycleBin(
      TEST_RECYCLE_BIN_NAME
    );
    expect(found).toBeDefined();

    // Call the tool
    const result = await DeleteFromRecycleBinTool.handler(
      { id: found!.id },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();

    // Should not be found after deletion
    found = await DocumentTestHelper.findDocumentInRecycleBin(
      TEST_RECYCLE_BIN_NAME
    );
    expect(found).toBeUndefined();
  });

  it("should handle deleting a non-existent document from the recycle bin", async () => {
    const result = await DeleteFromRecycleBinTool.handler(
      { id: BLANK_UUID },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
  });
});
