import UpdateDocumentBlueprintTool from "../put/update-blueprint.js";
import { DocumentBlueprintBuilder } from "./helpers/document-blueprint-builder.js";
import { DocumentBlueprintTestHelper } from "./helpers/document-blueprint-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("update-document-blueprint", () => {
  const TEST_BLUEPRINT_NAME = "_Test Blueprint Update";
  const UPDATED_BLUEPRINT_NAME = "_Test Blueprint Updated";
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test blueprints
    await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_NAME);
    await DocumentBlueprintTestHelper.cleanup(UPDATED_BLUEPRINT_NAME);
  });

  it("should update a document blueprint", async () => {
    // Create a blueprint to update
    const builder = await new DocumentBlueprintBuilder(
      TEST_BLUEPRINT_NAME
    ).create();

    // Create update model using builder
    const updateModel = new DocumentBlueprintBuilder(
      UPDATED_BLUEPRINT_NAME
    ).build();

    // Update the blueprint
    const result = await UpdateDocumentBlueprintTool.handler(
      {
        id: builder.getId(),
        data: {
          values: updateModel.values,
          variants: updateModel.variants,
        },
      },
      createMockRequestHandlerExtra()
    );

    // Verify the handler response using snapshot
    expect(result).toMatchSnapshot();

    // Verify the blueprint was updated
    const found = await DocumentBlueprintTestHelper.findDocumentBlueprint(
      UPDATED_BLUEPRINT_NAME
    );
    expect(found).toBeDefined();
    expect(found!.id).toBe(builder.getId());
  });

  it("should handle non-existent document blueprint", async () => {
    const updateModel = new DocumentBlueprintBuilder(UPDATED_BLUEPRINT_NAME)
      .withValue("testAlias", "updatedValue")
      .build();

    const result = await UpdateDocumentBlueprintTool.handler(
      {
        id: BLANK_UUID,
        data: {
          values: updateModel.values,
          variants: updateModel.variants,
        },
      },
      createMockRequestHandlerExtra()
    );

    // Verify the error response using snapshot
    expect(result).toMatchSnapshot();
  });
});
