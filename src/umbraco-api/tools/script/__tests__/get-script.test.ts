import GetScriptByPathTool from "../get/get-script-by-path.js";
import GetScriptFolderByPathTool from "../get/get-script-folder-by-path.js";
import { ScriptBuilder } from "./helpers/script-builder.js";
import { ScriptFolderBuilder } from "./helpers/script-folder-builder.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_SCRIPT_NAME = "_TestScriptGet";
const TEST_SCRIPT_CONTENT = "console.log('test script get');";
const TEST_FOLDER_NAME = "_TestFolderGet";
const NONEXISTENT_SCRIPT_PATH = "/NonExistentScript.js";
const NONEXISTENT_FOLDER_PATH = "/NonExistentFolder";

describe("get-script", () => {
  setupTestEnvironment();

  let scriptBuilder: ScriptBuilder;
  let folderBuilder: ScriptFolderBuilder;

  beforeEach(() => {
    scriptBuilder = new ScriptBuilder();
    folderBuilder = new ScriptFolderBuilder();
  });

  afterEach(async () => {
    await scriptBuilder.cleanup();
    await folderBuilder.cleanup();
  });

  describe("get-script-by-path", () => {
    it("should get a script by path", async () => {
      // Create a script first
      await scriptBuilder
        .withName(TEST_SCRIPT_NAME)
        .withContent(TEST_SCRIPT_CONTENT)
        .create();

      const result = await GetScriptByPathTool.handler({
        path: scriptBuilder.getPath(),
      }, createMockRequestHandlerExtra());

      // Validate response against tool's outputSchema
      const data = validateToolResponse(GetScriptByPathTool, result);
      expect(createSnapshotResult(data)).toMatchSnapshot();
    });

    it("should handle non-existent script", async () => {
      const result = await GetScriptByPathTool.handler({
        path: NONEXISTENT_SCRIPT_PATH,
      }, createMockRequestHandlerExtra());

      expect(result).toMatchSnapshot();
    });
  });

  describe("get-script-folder-by-path", () => {
    it("should get a script folder by path", async () => {
      // Create a folder first
      await folderBuilder
        .withName(TEST_FOLDER_NAME)
        .create();

      const result = await GetScriptFolderByPathTool.handler({
        path: folderBuilder.getPath(),
      }, createMockRequestHandlerExtra());

      // Validate response against tool's outputSchema
      const data = validateToolResponse(GetScriptFolderByPathTool, result);
      expect(createSnapshotResult(data)).toMatchSnapshot();
    });

    it("should handle non-existent script folder", async () => {
      const result = await GetScriptFolderByPathTool.handler({
        path: NONEXISTENT_FOLDER_PATH,
      }, createMockRequestHandlerExtra());

      expect(result).toMatchSnapshot();
    });
  });
});
