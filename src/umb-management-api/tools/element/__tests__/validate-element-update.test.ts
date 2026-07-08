import ValidateElementUpdateTool from "../put/validate-element-update.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test ValidateElementUpdate";

describe("validate-element-update", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should validate a valid element update model", async () => {
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    const result = await ValidateElementUpdateTool.handler(
      {
        id: builder.getId(),
        data: {
          cultures: null,
          values: [],
          variants: [
            {
              culture: null,
              segment: null,
              name: TEST_ELEMENT_NAME,
            },
          ],
        },
      },
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });

  it("should handle non-existent element", async () => {
    const result = await ValidateElementUpdateTool.handler(
      {
        id: BLANK_UUID,
        data: {
          cultures: null,
          values: [],
          variants: [
            {
              culture: null,
              segment: null,
              name: TEST_ELEMENT_NAME,
            },
          ],
        },
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
  });
});
