import SortDocumentChildrenTool from "../put/sort-document-children.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ROOT_NAME = "_Test SortDocumentChildren Root";
const TEST_CHILD_NAMES = [
  "_Test SortDocumentChildren Child A",
  "_Test SortDocumentChildren Child B",
  "_Test SortDocumentChildren Child C"
];

describe("sort-document-children", () => {
  setupTestEnvironment();

  let rootId: string;

  beforeEach(async () => {
    // Create root
    const rootBuilder = await new DocumentBuilder()
      .withName(TEST_ROOT_NAME)
      .withRootDocumentType()
      .create();
    await rootBuilder.publish();
    rootId = rootBuilder.getId();
    // Create children - insert in ascending name order so a Name/Descending sort
    // must actually change the order for the assertion to be meaningful.
    for (const name of TEST_CHILD_NAMES) {
      const childBuilder = await new DocumentBuilder()
        .withName(name)
        .withContentDocumentType()
        .withParent(rootId)
        .create();
      await childBuilder.publish();
    }
  });

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_ROOT_NAME);
    for (const name of TEST_CHILD_NAMES) {
      await DocumentTestHelper.cleanup(name);
    }
  });

  it("should sort a document's children by Name in Descending order", async () => {
    const result = await SortDocumentChildrenTool.handler(
      {
        id: rootId,
        data: { culture: null, field: "Name", direction: "Descending" },
      },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();

    const fetched = await DocumentTestHelper.getChildren(rootId, 10);
    const fetchedNames = fetched.map(child => DocumentTestHelper.getNameFromItem(child));
    expect(fetchedNames).toEqual([...TEST_CHILD_NAMES].sort().reverse());
  });
});
