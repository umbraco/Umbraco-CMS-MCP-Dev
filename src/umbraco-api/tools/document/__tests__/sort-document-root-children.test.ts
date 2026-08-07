import SortDocumentRootChildrenTool from "../put/sort-document-root-children.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ROOT_NAMES = [
  "_Test SortDocumentRootChildren A",
  "_Test SortDocumentRootChildren B",
  "_Test SortDocumentRootChildren C"
];

describe("sort-document-root-children", () => {
  setupTestEnvironment();

  beforeEach(async () => {
    // Create root-level documents in ascending name order so a Name/Descending sort
    // must actually change the order for the assertion to be meaningful.
    for (const name of TEST_ROOT_NAMES) {
      const builder = await new DocumentBuilder()
        .withName(name)
        .withRootDocumentType()
        .create();
      await builder.publish();
    }
  });

  afterEach(async () => {
    for (const name of TEST_ROOT_NAMES) {
      await DocumentTestHelper.cleanup(name);
    }
  });

  it("should sort root-level documents by Name in Descending order", async () => {
    const result = await SortDocumentRootChildrenTool.handler(
      { culture: null, field: "Name", direction: "Descending" },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();

    const client = UmbracoManagementClient.getClient();
    const rootResponse = await client.getTreeDocumentRoot({ take: 100 });
    const fetchedNames = rootResponse.items
      .map(item => DocumentTestHelper.getNameFromItem(item))
      .filter(name => TEST_ROOT_NAMES.includes(name));

    expect(fetchedNames).toEqual([...TEST_ROOT_NAMES].sort().reverse());
  });
});
