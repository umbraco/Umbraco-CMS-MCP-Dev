import GetScriptItemsTool from "../get/get-script-items.js";
import { ScriptBuilder } from "./helpers/script-builder.js";
import { ScriptFolderBuilder } from "./helpers/script-folder-builder.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_SCRIPT_NAME_1 = "_TestScriptItems1";
const TEST_SCRIPT_CONTENT_1 = "console.log('test script items 1');";
const TEST_SCRIPT_NAME_2 = "_TestScriptItems2";
const TEST_SCRIPT_CONTENT_2 = "console.log('test script items 2');";
const TEST_FOLDER_NAME = "_TestFolderItems";
const NONEXISTENT_PATH = "/NonExistentScript.js";

describe("script-items", () => {
  setupTestEnvironment();

  let scriptBuilder1: ScriptBuilder;
  let scriptBuilder2: ScriptBuilder;
  let folderBuilder: ScriptFolderBuilder;

  beforeEach(() => {
    scriptBuilder1 = new ScriptBuilder();
    scriptBuilder2 = new ScriptBuilder();
    folderBuilder = new ScriptFolderBuilder();
  });

  afterEach(async () => {
    await scriptBuilder1.cleanup();
    await scriptBuilder2.cleanup();
    await folderBuilder.cleanup();
  });

  it("should get scripts by path array", async () => {
    await scriptBuilder1
      .withName(TEST_SCRIPT_NAME_1)
      .withContent(TEST_SCRIPT_CONTENT_1)
      .create();
    await scriptBuilder2
      .withName(TEST_SCRIPT_NAME_2)
      .withContent(TEST_SCRIPT_CONTENT_2)
      .create();

    const result = await GetScriptItemsTool.handler({
      path: [scriptBuilder1.getPath(), scriptBuilder2.getPath()]
    }, createMockRequestHandlerExtra());

    // Validate response against tool's outputSchema
    const data = validateToolResponse(GetScriptItemsTool, result);
    const normalizedItems = createSnapshotResult(data);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should get single script by path", async () => {
    await scriptBuilder1
      .withName(TEST_SCRIPT_NAME_1)
      .withContent(TEST_SCRIPT_CONTENT_1)
      .create();

    const result = await GetScriptItemsTool.handler({
      path: [scriptBuilder1.getPath()]
    }, createMockRequestHandlerExtra());

    // Validate response against tool's outputSchema
    const data = validateToolResponse(GetScriptItemsTool, result);
    const normalizedItems = createSnapshotResult(data);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should get script folder by path", async () => {
    await folderBuilder
      .withName(TEST_FOLDER_NAME)
      .create();

    const result = await GetScriptItemsTool.handler({
      path: [folderBuilder.getPath()]
    }, createMockRequestHandlerExtra());

    // Validate response against tool's outputSchema
    const data = validateToolResponse(GetScriptItemsTool, result);
    const normalizedItems = createSnapshotResult(data);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle empty array", async () => {
    const result = await GetScriptItemsTool.handler({
      path: []
    }, createMockRequestHandlerExtra());

    expect(result).toMatchSnapshot();
  });

  it("should handle non-existent script path", async () => {
    const result = await GetScriptItemsTool.handler({
      path: [NONEXISTENT_PATH]
    }, createMockRequestHandlerExtra());

    expect(result).toMatchSnapshot();
  });

  it("should handle no path parameter", async () => {
    const result = await GetScriptItemsTool.handler({ path: undefined }, createMockRequestHandlerExtra());

    expect(result).toMatchSnapshot();
  });
});
