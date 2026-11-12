import GetDocumentBlueprintFolderByIdArrayTool from "../get/get-document-blueprint-folder-by-id-array.js";
import { DocumentBlueprintFolderBuilder } from "./helpers/document-blueprint-folder-builder.js";
import { DocumentBlueprintTestHelper } from "./helpers/document-blueprint-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_FOLDER_NAME_1 = "_Test Blueprint Folder Items 1";
const TEST_FOLDER_NAME_2 = "_Test Blueprint Folder Items 2";

describe("get-document-blueprint-folder-by-id-array", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentBlueprintTestHelper.cleanup(TEST_FOLDER_NAME_1);
    await DocumentBlueprintTestHelper.cleanup(TEST_FOLDER_NAME_2);
  });

  it("should get folder items for multiple ids", async () => {
    const first = await new DocumentBlueprintFolderBuilder(TEST_FOLDER_NAME_1).create();
    const second = await new DocumentBlueprintFolderBuilder(TEST_FOLDER_NAME_2).create();

    const result = await GetDocumentBlueprintFolderByIdArrayTool.handler(
      { id: [first.getId(), second.getId()] },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(GetDocumentBlueprintFolderByIdArrayTool, result) as {
      items: { name: string }[];
    };
    expect(data.items.map((i) => i.name).sort()).toEqual([TEST_FOLDER_NAME_1, TEST_FOLDER_NAME_2]);
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should return no items for an unknown id", async () => {
    const result = await GetDocumentBlueprintFolderByIdArrayTool.handler(
      { id: [BLANK_UUID] },
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(GetDocumentBlueprintFolderByIdArrayTool, result) as { items: unknown[] };
    expect(data.items).toHaveLength(0);
  });
});
