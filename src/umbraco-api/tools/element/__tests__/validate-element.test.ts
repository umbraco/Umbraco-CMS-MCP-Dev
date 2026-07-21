import ValidateElementTool from "../post/validate-element.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test ValidateElement";

describe("validate-element", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should validate a valid element create model", async () => {
    const elementTypeId = await ElementTypeRegistry.getOrCreateElementTypeId();

    const model = {
      documentType: { id: elementTypeId },
      parent: undefined,
      id: undefined,
      values: [],
      variants: [
        {
          culture: null,
          segment: null,
          name: TEST_ELEMENT_NAME,
        },
      ],
    };

    const result = await ValidateElementTool.handler(
      model,
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });

  it("should handle invalid element model", async () => {
    const invalidModel = {
      documentType: { id: "00000000-0000-0000-0000-000000000001" },
      parent: undefined,
      id: undefined,
      values: [],
      variants: [
        {
          culture: null,
          segment: null,
          name: TEST_ELEMENT_NAME,
        },
      ],
    };

    const result = await ValidateElementTool.handler(
      invalidModel,
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
  });
});
