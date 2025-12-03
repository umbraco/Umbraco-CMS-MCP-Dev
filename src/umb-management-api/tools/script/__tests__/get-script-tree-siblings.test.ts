import { ScriptTestHelper } from "./helpers/script-test-helper.js";
import GetScriptTreeSiblingsTool from "../get/get-script-tree-siblings.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { ScriptFolderBuilder } from "./helpers/script-folder-builder.js";
import { ScriptBuilder } from "./helpers/script-builder.js";

describe("get-script-tree-siblings", () => {
  const TEST_FOLDER_NAME = "_TestFolderForSiblings";
  const TEST_SIBLING_1_NAME = "_TestSibling1.js";
  const TEST_SIBLING_2_NAME = "_TestSibling2.js";
  const TEST_TARGET_NAME = "_TestTargetScript.js";
  const TEST_CONTENT = "// Test script content\nconsole.log('test');";
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    await ScriptTestHelper.cleanup(TEST_SIBLING_1_NAME);
    await ScriptTestHelper.cleanup(TEST_SIBLING_2_NAME);
    await ScriptTestHelper.cleanup(TEST_TARGET_NAME);
    await ScriptTestHelper.cleanup(TEST_FOLDER_NAME);
    console.error = originalConsoleError;
  });

  it("should get sibling scripts", async () => {
    // Arrange: Create a parent folder with multiple children
    const folderBuilder = await new ScriptFolderBuilder()
      .withName(TEST_FOLDER_NAME)
      .create();

    // Create first sibling
    await new ScriptBuilder()
      .withName(TEST_SIBLING_1_NAME)
      .withContent(TEST_CONTENT)
      .withParent(folderBuilder.getPath())
      .create();

    // Create target script
    const targetBuilder = await new ScriptBuilder()
      .withName(TEST_TARGET_NAME)
      .withContent(TEST_CONTENT)
      .withParent(folderBuilder.getPath())
      .create();

    // Create second sibling
    await new ScriptBuilder()
      .withName(TEST_SIBLING_2_NAME)
      .withContent(TEST_CONTENT)
      .withParent(folderBuilder.getPath())
      .create();

    // Act: Get siblings for the target script
    const result = await GetScriptTreeSiblingsTool().handler(
      {
        path: targetBuilder.getPath(),
      },
      { signal: new AbortController().signal }
    );

    // Assert: Verify response
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent script", async () => {
    // Arrange: Use a non-existent path
    const nonExistentPath = "non-existent-path.js";

    // Act: Try to get siblings for non-existent script
    const result = await GetScriptTreeSiblingsTool().handler(
      {
        path: nonExistentPath,
      },
      { signal: new AbortController().signal }
    );

    // Assert: Verify error response
    expect(result).toMatchSnapshot();
  });
});
