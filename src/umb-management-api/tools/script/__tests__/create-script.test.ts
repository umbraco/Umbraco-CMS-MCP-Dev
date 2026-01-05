import CreateScriptTool from "../post/create-script.js";
import CreateScriptFolderTool from "../post/create-script-folder.js";
import { ScriptTestHelper } from "./helpers/script-test-helper.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_SCRIPT_NAME = "_TestScript";
const TEST_SCRIPT_CONTENT = "console.log('test script');";
const EXISTING_SCRIPT_NAME = "_ExistingScript";
const EXISTING_SCRIPT_CONTENT = "console.log('existing script');";
const TEST_FOLDER_NAME = "_TestFolder";
const EXISTING_FOLDER_NAME = "_ExistingFolder";

describe("create-script", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test scripts and folders
    await ScriptTestHelper.cleanup(TEST_SCRIPT_NAME.endsWith('.js') ? TEST_SCRIPT_NAME : TEST_SCRIPT_NAME + '.js');
    await ScriptTestHelper.cleanup(EXISTING_SCRIPT_NAME.endsWith('.js') ? EXISTING_SCRIPT_NAME : EXISTING_SCRIPT_NAME + '.js');
    await ScriptTestHelper.cleanup(TEST_FOLDER_NAME);
    await ScriptTestHelper.cleanup(EXISTING_FOLDER_NAME);
  });

  describe("create-script", () => {
    it("should create a script", async () => {
      const result = await CreateScriptTool.handler({
        name: TEST_SCRIPT_NAME + ".js",
        content: TEST_SCRIPT_CONTENT
      }, createMockRequestHandlerExtra());

      // Verify the handler response using snapshot
      expect(result).toMatchSnapshot();

      // Verify the created script exists
      const expectedName = TEST_SCRIPT_NAME + '.js';
      const script = await ScriptTestHelper.findScript(expectedName);
      expect(script).toBeDefined();
      expect(script?.name).toBe(expectedName);
    });

    it("should handle existing script", async () => {
      // First create the script
      await CreateScriptTool.handler({
        name: EXISTING_SCRIPT_NAME + ".js",
        content: EXISTING_SCRIPT_CONTENT
      }, createMockRequestHandlerExtra());

      // Try to create it again
      const result = await CreateScriptTool.handler({
        name: EXISTING_SCRIPT_NAME + ".js",
        content: EXISTING_SCRIPT_CONTENT
      }, createMockRequestHandlerExtra());

      // Verify the error response using snapshot
      expect(result).toMatchSnapshot();
    });
  });

  describe("create-script-folder", () => {
    it("should create a script folder", async () => {
      const result = await CreateScriptFolderTool.handler({
        name: TEST_FOLDER_NAME
      }, createMockRequestHandlerExtra());

      // Verify the handler response using snapshot
      expect(result).toMatchSnapshot();

      // Verify the created folder exists
      const folder = await ScriptTestHelper.findScript(TEST_FOLDER_NAME);
      expect(folder).toBeDefined();
      expect(folder?.name).toBe(TEST_FOLDER_NAME);
      expect(folder?.isFolder).toBe(true);
    });

    it("should handle existing script folder", async () => {
      // First create the folder
      await CreateScriptFolderTool.handler({
        name: EXISTING_FOLDER_NAME
      }, createMockRequestHandlerExtra());

      // Try to create it again
      const result = await CreateScriptFolderTool.handler({
        name: EXISTING_FOLDER_NAME
      }, createMockRequestHandlerExtra());

      // Verify the error response using snapshot
      expect(result).toMatchSnapshot();
    });
  });
});
