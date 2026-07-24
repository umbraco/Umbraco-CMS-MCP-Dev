import SortMediaRootChildrenTool from "../put/sort-media-root-children.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ROOT_NAMES = [
  "_Test SortMediaRootChildren A",
  "_Test SortMediaRootChildren B",
  "_Test SortMediaRootChildren C",
];

describe("sort-media-root-children", () => {
  setupTestEnvironment();

  beforeEach(async () => {
    // Create root-level media items in ascending name order so a Name/Descending sort
    // must actually change the order for the assertion to be meaningful.
    for (const name of TEST_ROOT_NAMES) {
      await new MediaBuilder().withName(name).withFolderMediaType().create();
    }
  });

  afterEach(async () => {
    for (const name of TEST_ROOT_NAMES) {
      await MediaTestHelper.cleanup(name);
    }
  });

  it("should sort root-level media items by Name in Descending order", async () => {
    const result = await SortMediaRootChildrenTool.handler(
      { field: "Name", direction: "Descending" },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();

    const client = UmbracoManagementClient.getClient();
    const rootResponse = await client.getTreeMediaRoot({ take: 100 });
    const fetchedNames = rootResponse.items
      .map((item) => MediaTestHelper.getNameFromItem(item))
      .filter((name) => TEST_ROOT_NAMES.includes(name));

    expect(fetchedNames).toEqual([...TEST_ROOT_NAMES].sort().reverse());
  });
});
