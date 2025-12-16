import GetScriptByPathTool from "../get/get-script-by-path.js";
import GetScriptFolderByPathTool from "../get/get-script-folder-by-path.js";
import { ScriptBuilder } from "./helpers/script-builder.js";
import { ScriptFolderBuilder } from "./helpers/script-folder-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_SCRIPT_NAME = "_TestScriptGet";
const TEST_SCRIPT_CONTENT = "console.log('test script get');";
const TEST_FOLDER_NAME = "_TestFolderGet";
const NONEXISTENT_SCRIPT_PATH = "/NonExistentScript.js";
const NONEXISTENT_FOLDER_PATH = "/NonExistentFolder";

describe("get-script", () => {
  let originalConsoleError: typeof console.error;
  let scriptBuilder: ScriptBuilder;
  let folderBuilder: ScriptFolderBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    scriptBuilder = new ScriptBuilder();
    folderBuilder = new ScriptFolderBuilder();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
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
      }, {
        signal: new AbortController().signal,
      });

      expect(createSnapshotResult(result)).toMatchSnapshot();
    });

    it("should handle non-existent script", async () => {
      const result = await GetScriptByPathTool.handler({
        path: NONEXISTENT_SCRIPT_PATH,
      }, {
        signal: new AbortController().signal,
      });

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
      }, {
        signal: new AbortController().signal,
      });

      expect(createSnapshotResult(result)).toMatchSnapshot();
    });

    it("should handle non-existent script folder", async () => {
      const result = await GetScriptFolderByPathTool.handler({
        path: NONEXISTENT_FOLDER_PATH,
      }, {
        signal: new AbortController().signal,
      });

      expect(result).toMatchSnapshot();
    });
  });
});