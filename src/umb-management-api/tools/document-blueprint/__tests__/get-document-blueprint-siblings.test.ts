import { DocumentBlueprintTestHelper } from "./helpers/document-blueprint-test-helper.js";
import GetDocumentBlueprintSiblingsTool from "../get/get-siblings.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { DocumentBlueprintFolderBuilder } from "./helpers/document-blueprint-folder-builder.js";
import { DocumentBlueprintBuilder } from "./helpers/document-blueprint-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";

describe("get-document-blueprint-siblings", () => {
  const TEST_FOLDER_NAME = "_Test Siblings Folder";
  const TEST_BLUEPRINT_1 = "_Test Sibling Blueprint 1";
  const TEST_BLUEPRINT_2 = "_Test Sibling Blueprint 2";
  const TEST_BLUEPRINT_3 = "_Test Sibling Blueprint 3";
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    // Clean up test items - must delete children before parent
    await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_1);
    await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_2);
    await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_3);
    await DocumentBlueprintTestHelper.cleanup(TEST_FOLDER_NAME);

    // Restore console.error after cleanup
    console.error = originalConsoleError;
  }, 15000);

  it("should get sibling blueprints", async () => {
    // Arrange: Create a parent folder
    const folderBuilder = await new DocumentBlueprintFolderBuilder(
      TEST_FOLDER_NAME
    ).create();

    // Create multiple child blueprints at the same level
    const blueprint1 = await new DocumentBlueprintBuilder(TEST_BLUEPRINT_1)
      .withParentId(folderBuilder.getId())
      .create();

    await new DocumentBlueprintBuilder(TEST_BLUEPRINT_2)
      .withParentId(folderBuilder.getId())
      .create();

    await new DocumentBlueprintBuilder(TEST_BLUEPRINT_3)
      .withParentId(folderBuilder.getId())
      .create();

    // Act: Get siblings of blueprint1
    const result = await GetDocumentBlueprintSiblingsTool.handler(
      {
        target: blueprint1.getId(),
      },
      { signal: new AbortController().signal }
    );

    // Assert: Normalize and verify response
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  }, 15000);

  it("should handle non-existent target", async () => {
    // Act: Try to get siblings of non-existent item
    const result = await GetDocumentBlueprintSiblingsTool.handler(
      {
        target: BLANK_UUID,
      },
      { signal: new AbortController().signal }
    );

    // Assert: Verify error response
    expect(result).toMatchSnapshot();
  });
});
