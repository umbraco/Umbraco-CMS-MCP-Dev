import GetDocumentBlueprintScaffoldTool from "../get/get-document-blueprint-scaffold.js";
import { DocumentBlueprintBuilder } from "./helpers/document-blueprint-builder.js";
import { DocumentBlueprintTestHelper } from "./helpers/document-blueprint-test-helper.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { jest } from "@jest/globals";

const TEST_BLUEPRINT_NAME = "_Test Blueprint Scaffold";

describe("get-document-blueprint-scaffold", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_NAME);
  });

  it("should get scaffold for document blueprint", async () => {
    // Arrange: Create a document blueprint
    const builder = await new DocumentBlueprintBuilder(TEST_BLUEPRINT_NAME)
      .create();

    // Act: Get scaffold for the blueprint
    const result = await GetDocumentBlueprintScaffoldTool.handler(
      { id: builder.getId() },
      createMockRequestHandlerExtra()
    );

    // Assert: Verify the response structure without snapshots due to ID normalization issues
    const parsedResponse = result.structuredContent as any;

    // Verify key properties exist and are correct
    expect(parsedResponse).toHaveProperty('documentType');
    expect(parsedResponse).toHaveProperty('id');
    expect(parsedResponse).toHaveProperty('values');
    expect(parsedResponse).toHaveProperty('variants');
    expect(parsedResponse.variants[0].name).toBe(TEST_BLUEPRINT_NAME);
    expect(parsedResponse.documentType.id).toBe("a95360e8-ff04-40b1-8f46-7aa4b5983096"); // ROOT_DOCUMENT_TYPE_ID
    expect(Array.isArray(parsedResponse.values)).toBe(true);
    expect(Array.isArray(parsedResponse.variants)).toBe(true);
  });

  it("should handle non-existent blueprint", async () => {
    // Act: Try to get scaffold for non-existent blueprint
    const result = await GetDocumentBlueprintScaffoldTool.handler(
      { id: "00000000-0000-0000-0000-000000000000" },
      createMockRequestHandlerExtra()
    );

    // Assert: Should handle gracefully
    expect(result).toMatchSnapshot();
  });
});