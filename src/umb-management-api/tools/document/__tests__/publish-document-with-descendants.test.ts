import PublishDocumentWithDescendantsTool from "../put/publish-document-with-descendants.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_ROOT_NAME = "_Test PublishWithDescendants Root";
const TEST_CHILD_NAMES = [
  "_Test PublishWithDescendants Child 1",
  "_Test PublishWithDescendants Child 2",
];

describe("publish-document-with-descendants", () => {
  setupTestEnvironment();

  let rootId: string;
  let childIds: string[];

  beforeEach(async () => {
    // Create root
    const rootBuilder = await new DocumentBuilder()
      .withName(TEST_ROOT_NAME)
      .withRootDocumentType()
      .create();
    rootId = rootBuilder.getId();
    // Create children
    childIds = [];
    for (const name of TEST_CHILD_NAMES) {
      const childBuilder = await new DocumentBuilder()
        .withName(name)
        .withContentDocumentType()
        .withParent(rootId)
        .create();
      childIds.push(childBuilder.getId());
    }
  });

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_ROOT_NAME);
    for (const name of TEST_CHILD_NAMES) {
      await DocumentTestHelper.cleanup(name);
    }
  });

  it("should publish a document and its descendants", async () => {
    const result = await PublishDocumentWithDescendantsTool.handler(
      {
        id: rootId,
        data: { includeUnpublishedDescendants: true, cultures: [] },
      },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();

    // Check published state of root and children
    const root = await DocumentTestHelper.findDocument(TEST_ROOT_NAME);
    expect(root).toBeDefined();
    if (!root) throw new Error("Root document not found");

    expect(root.documentType).toBeDefined();
    expect(root.variants.some((v: any) => v.state === "Published")).toBe(true);
    for (const name of TEST_CHILD_NAMES) {
      const child = await DocumentTestHelper.findDocument(name);
      expect(child).toBeDefined();
      if (!child) throw new Error(`Child document '${name}' not found`);
      expect(child.documentType).toBeDefined();
      expect(child.variants.some((v: any) => v.state === "Published")).toBe(
        true
      );
    }
  });

  it("should handle publishing a non-existent document", async () => {
    const result = await PublishDocumentWithDescendantsTool.handler(
      {
        id: "1234567890",
        data: { includeUnpublishedDescendants: true, cultures: [] },
      },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
  });
});
