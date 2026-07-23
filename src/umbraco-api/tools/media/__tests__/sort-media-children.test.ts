import SortMediaChildrenTool from "../put/sort-media-children.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ROOT_NAME = "_Test SortMediaChildren Root";
const TEST_CHILD_NAMES = [
  "_Test SortMediaChildren Child A",
  "_Test SortMediaChildren Child B",
  "_Test SortMediaChildren Child C",
];

describe("sort-media-children", () => {
  setupTestEnvironment();

  let rootId: string;

  beforeEach(async () => {
    const rootBuilder = await new MediaBuilder()
      .withName(TEST_ROOT_NAME)
      .withFolderMediaType()
      .create();
    rootId = rootBuilder.getId();

    // Create children in ascending name order so a Name/Descending sort
    // must actually change the order for the assertion to be meaningful.
    for (const name of TEST_CHILD_NAMES) {
      await new MediaBuilder()
        .withName(name)
        .withFolderMediaType()
        .withParent(rootId)
        .create();
    }
  });

  afterEach(async () => {
    await MediaTestHelper.cleanup(TEST_ROOT_NAME);
    for (const name of TEST_CHILD_NAMES) {
      await MediaTestHelper.cleanup(name);
    }
  });

  it("should sort a media item's children by Name in Descending order", async () => {
    const result = await SortMediaChildrenTool.handler(
      {
        id: rootId,
        data: { field: "Name", direction: "Descending" },
      },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();

    const fetched = await MediaTestHelper.getChildren(rootId, 10);
    const fetchedNames = fetched.map((child) =>
      MediaTestHelper.getNameFromItem(child)
    );
    expect(fetchedNames).toEqual([...TEST_CHILD_NAMES].sort().reverse());
  });
});
