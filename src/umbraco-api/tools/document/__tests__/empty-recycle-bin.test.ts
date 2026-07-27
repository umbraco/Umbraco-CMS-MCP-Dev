import EmptyRecycleBinTool from "../put/empty-recycle-bin.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("empty-recycle-bin", () => {
  setupTestEnvironment();

  const TEST_RECYCLE_BIN_NAME = "_Test EmptyRecycleBinTool";

  beforeEach(async () => {
    await DocumentTestHelper.emptyRecycleBin();
  });

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_RECYCLE_BIN_NAME);
  });

  it("should empty the recycle bin", async () => {
    // Create and move a document to the recycle bin
    const builder = await new DocumentBuilder()
      .withName(TEST_RECYCLE_BIN_NAME)
      .withRootDocumentType()
      .create();
    await builder.moveToRecycleBin();

    // Should be found in recycle bin
    let found = await DocumentTestHelper.findDocumentInRecycleBin(TEST_RECYCLE_BIN_NAME);
    expect(found).toBeDefined();

    // Call the tool
    const result = await EmptyRecycleBinTool.handler({}, createMockRequestHandlerExtra());
    expect(result).toMatchSnapshot();

    // Should not be found after emptying
    found = await DocumentTestHelper.findDocumentInRecycleBin(TEST_RECYCLE_BIN_NAME);
    expect(found).toBeUndefined();
  });

  it("should handle emptying an already empty recycle bin", async () => {
    // Call the tool on an empty recycle bin
    const result = await EmptyRecycleBinTool.handler({}, createMockRequestHandlerExtra());
    expect(result).toMatchSnapshot();
  });
}); 