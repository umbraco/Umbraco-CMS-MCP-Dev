import DeleteScriptTool from "../delete/delete-script.js";
import DeleteScriptFolderTool from "../delete/delete-script-folder.js";
import { ScriptBuilder } from "./helpers/script-builder.js";
import { ScriptFolderBuilder } from "./helpers/script-folder-builder.js";
import { ScriptTestHelper } from "./helpers/script-test-helper.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_SCRIPT_NAME = "_TestScriptDelete";
const TEST_SCRIPT_CONTENT = "console.log('test script delete');";
const TEST_FOLDER_NAME = "_TestFolderDelete";
const NONEXISTENT_PATH = "/NonExistentScript.js";

describe("delete-script", () => {
  setupTestEnvironment();

  let scriptBuilder: ScriptBuilder;
  let folderBuilder: ScriptFolderBuilder;

  beforeEach(() => {
    scriptBuilder = new ScriptBuilder();
    folderBuilder = new ScriptFolderBuilder();
  });

  describe("delete-script", () => {
    it("should delete a script", async () => {
      // Create initial script
      await scriptBuilder
        .withName(TEST_SCRIPT_NAME)
        .withContent(TEST_SCRIPT_CONTENT)
        .create();

      const result = await DeleteScriptTool.handler(
        {
          path: scriptBuilder.getPath(),
        },
        createMockRequestHandlerExtra()
      );

      // Verify the handler response using snapshot
      expect(result).toMatchSnapshot();

      // Verify the script no longer exists
      const script = await ScriptTestHelper.findScript(TEST_SCRIPT_NAME + ".js");
      expect(script).toBeUndefined();
    });

    it("should handle non-existent script", async () => {
      const result = await DeleteScriptTool.handler(
        {
          path: NONEXISTENT_PATH,
        },
        createMockRequestHandlerExtra()
      );

      // Verify the error response using snapshot
      expect(result).toMatchSnapshot();
    });
  });

  describe("delete-script-folder", () => {
    it("should delete a script folder", async () => {
      // Create initial folder
      await folderBuilder
        .withName(TEST_FOLDER_NAME)
        .create();

      const result = await DeleteScriptFolderTool.handler(
        {
          path: folderBuilder.getPath(),
        },
        createMockRequestHandlerExtra()
      );

      // Verify the handler response using snapshot
      expect(result).toMatchSnapshot();

      // Verify the folder no longer exists
      const folder = await ScriptTestHelper.findScript(TEST_FOLDER_NAME);
      expect(folder).toBeUndefined();
    });

    it("should handle non-existent script folder", async () => {
      const result = await DeleteScriptFolderTool.handler(
        {
          path: "/NonExistentFolder",
        },
        createMockRequestHandlerExtra()
      );

      // Verify the error response using snapshot
      expect(result).toMatchSnapshot();
    });
  });
});
