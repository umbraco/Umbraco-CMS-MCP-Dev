import GetDocumentBlueprintTool from "../get/get-blueprint.js";
import { DocumentBlueprintBuilder } from "./helpers/document-blueprint-builder.js";
import { DocumentBlueprintTestHelper } from "./helpers/document-blueprint-test-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";

describe("get-document-blueprint", () => {
  const TEST_BLUEPRINT_NAME = "_Test Blueprint Get";
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_NAME);
  });

  it("should get a document blueprint by id", async () => {
    // Create a blueprint to get
    const builder = await new DocumentBlueprintBuilder(
      TEST_BLUEPRINT_NAME
    ).create();

    // Get the blueprint
    const result = await GetDocumentBlueprintTool.handler(
      {
        id: builder.getId(),
      },
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
  });

  it("should handle non-existent document blueprint", async () => {
    const result = await GetDocumentBlueprintTool.handler(
      {
        id: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
});
