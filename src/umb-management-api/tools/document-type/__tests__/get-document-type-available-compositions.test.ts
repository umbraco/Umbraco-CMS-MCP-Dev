import GetDocumentTypeAvailableCompositionsTool from "../post/get-document-type-available-compositions.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import { DocumentTypeCompositionResponseModel } from "@/umb-management-api/schemas/index.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_DOCTYPE_NAME = "_Test DocumentType Available";
const TEST_COMPOSITION_NAME = "_Test Available Composition";

describe("get-document-type-available-compositions", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test document types
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_COMPOSITION_NAME);
  });

  it("should get available compositions for a document type", async () => {
    // Create a document type that will be available as a composition
    await new DocumentTypeBuilder()
      .withName(TEST_COMPOSITION_NAME)
      .withIcon("icon-document")
      .create();

    // Create a document type to test available compositions for
    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .create();

    // Get the available compositions
    const result = await GetDocumentTypeAvailableCompositionsTool.handler(
      {
        id: docTypeBuilder.getId(),
        currentPropertyAliases: [],
        currentCompositeIds: [],
        isElement: false,
      } as any, createMockRequestHandlerExtra()
    );

    // Parse and filter just our test composition
    const data = result.structuredContent as { items: Record<string, DocumentTypeCompositionResponseModel> };
    const parsed = data.items;
    const testComposition =
      parsed[
        Object.keys(parsed).find(
          (key) => parsed[key].name === TEST_COMPOSITION_NAME
        ) ?? ""
      ];

    if (!testComposition) {
      throw new Error("Test composition not found in results");
    }

    testComposition.id = BLANK_UUID;

    // Verify just the test composition
    expect(testComposition).toMatchSnapshot();
  });
});
