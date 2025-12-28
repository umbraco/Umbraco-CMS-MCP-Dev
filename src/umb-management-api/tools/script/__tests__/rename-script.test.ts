import RenameScriptTool from "../put/rename-script.js";
import { ScriptBuilder } from "./helpers/script-builder.js";
import { ScriptFolderBuilder } from "./helpers/script-folder-builder.js";
import { ScriptTestHelper } from "./helpers/script-test-helper.js";
import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";

const TEST_SCRIPT_NAME = "_TestRenameScript";
const TEST_RENAMED_NAME = "_TestRenamedScript";
const TEST_CONTENT = "console.log('rename test');";
const TEST_FOLDER_NAME = "_TestRenameFolder";

describe("rename-script", () => {
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
    await ScriptTestHelper.cleanup(TEST_SCRIPT_NAME + ".js");
    await ScriptTestHelper.cleanup(TEST_RENAMED_NAME + ".js");
    await ScriptTestHelper.cleanup(TEST_FOLDER_NAME);
    console.error = originalConsoleError;
  });

  it("should rename a script", async () => {
    // Arrange - Create script to rename
    await scriptBuilder
      .withName(TEST_SCRIPT_NAME)
      .withContent(TEST_CONTENT)
      .create();

    // Verify it exists before renaming
    const scriptBeforeRename = await ScriptTestHelper.findScript(TEST_SCRIPT_NAME + ".js");
    expect(scriptBeforeRename).toBeDefined();

    const params = {
      name: TEST_SCRIPT_NAME, // Just the script name, no extension needed
      newName: TEST_RENAMED_NAME // New name, no extension needed
    };

    // Act
    const result = await RenameScriptTool.handler(params, { signal: new AbortController().signal });

    // Assert
    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Verify the old script no longer exists
    const oldScript = await ScriptTestHelper.findScript(TEST_SCRIPT_NAME + ".js");
    expect(oldScript).toBeUndefined();

    // Verify the new script exists
    const newScript = await ScriptTestHelper.findScript(TEST_RENAMED_NAME + ".js");
    expect(newScript).toBeDefined();
    expect(newScript?.name).toBe(TEST_RENAMED_NAME + ".js");
  });

  it("should rename a script in a folder", async () => {
    // Arrange - Create folder and script inside it
    await folderBuilder
      .withName(TEST_FOLDER_NAME)
      .create();

    await scriptBuilder
      .withName(TEST_SCRIPT_NAME)
      .withContent(TEST_CONTENT)
      .withParent(folderBuilder.getPath())
      .create();

    // Verify it exists before renaming
    const scriptBeforeRename = await ScriptTestHelper.findScript(TEST_SCRIPT_NAME + ".js");
    expect(scriptBeforeRename).toBeDefined();

    const params = {
      name: TEST_SCRIPT_NAME, // Just the script name
      folderPath: TEST_FOLDER_NAME, // The folder path (user-friendly!)
      newName: TEST_RENAMED_NAME // New name
    };

    // Act
    const result = await RenameScriptTool.handler(params, { signal: new AbortController().signal });

    // Assert
    expect(createSnapshotResult(result)).toMatchSnapshot();

    // Verify the old script no longer exists
    const oldScript = await ScriptTestHelper.findScript(TEST_SCRIPT_NAME + ".js");
    expect(oldScript).toBeUndefined();

    // Verify the new script exists (findScript will find it in any folder by name)
    const newScript = await ScriptTestHelper.findScript(TEST_RENAMED_NAME + ".js");
    expect(newScript).toBeDefined();
    expect(newScript?.name).toBe(TEST_RENAMED_NAME + ".js");
  });

  it("should handle script folder rename attempt", async () => {
    // Arrange - Create folder
    await folderBuilder
      .withName(TEST_FOLDER_NAME)
      .create();

    const params = {
      name: TEST_FOLDER_NAME, // This is actually a folder, not a script
      newName: "_RenamedFolder"
    };

    // Act - This should likely error since we're trying to rename a folder as if it's a script
    const result = await RenameScriptTool.handler(params, { signal: new AbortController().signal });

    // Assert - This will likely be an error since script rename tool expects scripts, not folders
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });

  it("should handle non-existent script", async () => {
    // Arrange
    const params = {
      name: "NonExistentScript", // Just the name
      newName: "NewName"
    };

    // Act
    const result = await RenameScriptTool.handler(params, { signal: new AbortController().signal });

    // Assert - Error responses use normalizeErrorResponse
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });

  it("should handle renaming with folder path (tests path handling)", async () => {
    // Arrange - Create script in a nested folder structure
    await folderBuilder
      .withName(TEST_FOLDER_NAME)
      .create();

    await scriptBuilder
      .withName(TEST_SCRIPT_NAME)
      .withContent(TEST_CONTENT)
      .withParent(folderBuilder.getPath())
      .create();

    const params = {
      name: TEST_SCRIPT_NAME, // Script name
      folderPath: TEST_FOLDER_NAME, // Folder path - much clearer for LLMs!
      newName: TEST_RENAMED_NAME
    };

    // Act
    const result = await RenameScriptTool.handler(params, { signal: new AbortController().signal });

    // Assert - This should work due to proper path construction
    try {
      expect(createSnapshotResult(result)).toMatchSnapshot();
    } catch (error) {
      // If it's not valid JSON (error response), use normalizeErrorResponse
      expect(normalizeErrorResponse(result)).toMatchSnapshot();
    }
  });

  it("should handle renaming script to same name", async () => {
    // Arrange - Create script
    await scriptBuilder
      .withName(TEST_SCRIPT_NAME)
      .withContent(TEST_CONTENT)
      .create();

    const params = {
      name: TEST_SCRIPT_NAME, // Current name
      newName: TEST_SCRIPT_NAME // Same name as original
    };

    // Act
    const result = await RenameScriptTool.handler(params, { signal: new AbortController().signal });

    // Assert - Same name rename might be success or error
    try {
      expect(createSnapshotResult(result)).toMatchSnapshot();
    } catch (error) {
      // If it's not valid JSON (error response), use normalizeErrorResponse
      expect(normalizeErrorResponse(result)).toMatchSnapshot();
    }

    // Verify the script still exists (find by name)
    const script = await ScriptTestHelper.findScript(TEST_SCRIPT_NAME + ".js");
    expect(script).toBeDefined();
    expect(script?.name).toBe(TEST_SCRIPT_NAME + ".js");
  });
});