import CreateDocumentBlueprintFromDocumentTool from "../post/create-document-blueprint-from-document.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { DocumentBuilder } from "../../document/__tests__/helpers/document-builder.js";
import { DocumentTestHelper } from "../../document/__tests__/helpers/document-test-helper.js";
import { DocumentBlueprintTestHelper } from "./helpers/document-blueprint-test-helper.js";
import { jest } from "@jest/globals";

const TEST_DOCUMENT_NAME = "_Test Source Document";
const TEST_BLUEPRINT_NAME = "_Test Blueprint From Document";

describe("create-document-blueprint-from-document", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_NAME);
  });

  it("should create document blueprint from existing document", async () => {
    // Arrange: Create a source document
    const documentBuilder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();

    const sourceDocument = documentBuilder.getCreatedItem();

    // Act: Create blueprint from document
    const result = await CreateDocumentBlueprintFromDocumentTool.handler(
      {
        name: TEST_BLUEPRINT_NAME,
        document: { id: sourceDocument.id }
      },
      { signal: new AbortController().signal }
    );

    // Assert: Verify the response
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Verify the blueprint was created
    const createdBlueprint = await DocumentBlueprintTestHelper.findDocumentBlueprint(TEST_BLUEPRINT_NAME);
    expect(createdBlueprint).toBeDefined();
    expect(createdBlueprint?.name).toBe(TEST_BLUEPRINT_NAME);
  });

  it("should handle non-existent source document", async () => {
    // Act: Try to create blueprint from non-existent document
    const result = await CreateDocumentBlueprintFromDocumentTool.handler(
      {
        name: TEST_BLUEPRINT_NAME,
        document: { id: "00000000-0000-0000-0000-000000000000" }
      },
      { signal: new AbortController().signal }
    );

    // Assert: Should handle gracefully
    expect(result).toMatchSnapshot();
  });

  it("should handle duplicate blueprint name", async () => {
    // Arrange: Create a source document and an initial blueprint
    const documentBuilder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();

    const sourceDocument = documentBuilder.getCreatedItem();

    // First create a blueprint
    await CreateDocumentBlueprintFromDocumentTool.handler(
      {
        name: TEST_BLUEPRINT_NAME,
        document: { id: sourceDocument.id }
      },
      { signal: new AbortController().signal }
    );

    // Act: Try to create another blueprint with the same name
    const result = await CreateDocumentBlueprintFromDocumentTool.handler(
      {
        name: TEST_BLUEPRINT_NAME,
        document: { id: sourceDocument.id }
      },
      { signal: new AbortController().signal }
    );

    // Assert: Should handle duplicate name gracefully
    expect(result).toMatchSnapshot();
  });
});