import GetDocumentBlueprintByIdArrayTool from "../get/get-document-blueprint-by-id-array.js";
import { DocumentBlueprintBuilder } from "./helpers/document-blueprint-builder.js";
import { DocumentBlueprintTestHelper } from "./helpers/document-blueprint-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-item-document-blueprint", () => {
  setupTestEnvironment();

  const TEST_BLUEPRINT_NAME = "_Test Item Blueprint";
  const TEST_BLUEPRINT_NAME_2 = "_Test Item Blueprint2";

  // Helper to get items from structuredContent
  const getItems = (result: any) => {
    const content = result.structuredContent;
    if (content && content.items) {
      return content.items;
    }
    return content ?? [];
  };  afterEach(async () => {
    await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_NAME);
    await DocumentBlueprintTestHelper.cleanup(TEST_BLUEPRINT_NAME_2);
  });

  it("should get no document blueprints for empty request", async () => {
    // Get all document blueprints
    const result = await GetDocumentBlueprintByIdArrayTool.handler(
      {} as any,
      createMockRequestHandlerExtra()
    );
    const items = getItems(result);
    expect(items).toMatchSnapshot();
  });

  it("should get single document blueprint by ID", async () => {
    // Create a document blueprint
    const builder = await new DocumentBlueprintBuilder(
      TEST_BLUEPRINT_NAME
    ).create();

    // Get by ID
    const result = await GetDocumentBlueprintByIdArrayTool.handler(
      { id: [builder.getId()] },
      createMockRequestHandlerExtra()
    );
    const items = getItems(result);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe(TEST_BLUEPRINT_NAME);
    // Normalize for snapshot
    items[0].id = BLANK_UUID;
    expect(items).toMatchSnapshot();
  });

  it("should get multiple document blueprints by ID", async () => {
    // Create first document blueprint
    const builder1 = await new DocumentBlueprintBuilder(
      TEST_BLUEPRINT_NAME
    ).create();

    // Create second document blueprint
    const builder2 = await new DocumentBlueprintBuilder(
      TEST_BLUEPRINT_NAME_2
    ).create();

    // Get by IDs
    const result = await GetDocumentBlueprintByIdArrayTool.handler(
      {
        id: [builder1.getId(), builder2.getId()],
      },
      createMockRequestHandlerExtra()
    );

    const items = getItems(result);
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe(TEST_BLUEPRINT_NAME);
    expect(items[1].name).toBe(TEST_BLUEPRINT_NAME_2);

    // Normalize for snapshot
    items.forEach((item: any) => {
      item.id = BLANK_UUID;
    });
    expect(items).toMatchSnapshot();
  });
});
