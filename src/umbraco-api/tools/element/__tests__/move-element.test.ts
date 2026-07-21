import MoveElementTool from "../put/move-element.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementFolderBuilder } from "./helpers/element-folder-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element Move";
const TEST_FOLDER_NAME = "_Test Element Move Folder";

describe("move-element", () => {
  setupTestEnvironment();

  let folderBuilder: ElementFolderBuilder | null = null;

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
    if (folderBuilder) {
      await folderBuilder.cleanup();
      folderBuilder = null;
    }
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should move an element to a folder", async () => {
    folderBuilder = new ElementFolderBuilder(TEST_FOLDER_NAME);
    await folderBuilder.create();

    const elementBuilder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    const result = await MoveElementTool.handler(
      {
        id: elementBuilder.getId(),
        data: {
          target: {
            id: folderBuilder.getId(),
          },
        },
      },
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();

    const found = await ElementTestHelper.findElement(TEST_ELEMENT_NAME);
    expect(found).toBeDefined();
    expect(found!.parent?.id).toBe(folderBuilder.getId());
  });

  it("should handle moving non-existent element", async () => {
    const result = await MoveElementTool.handler(
      {
        id: BLANK_UUID,
        data: {
          target: undefined,
        },
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
  });
});
