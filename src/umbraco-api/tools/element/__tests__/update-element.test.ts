import UpdateElementTool from "../put/update-element.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test Element Update";
const UPDATED_ELEMENT_NAME = "_Test Element Updated";

describe("update-element", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
    await ElementTestHelper.cleanup(UPDATED_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should update an element", async () => {
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    const result = await UpdateElementTool.handler(
      {
        id: builder.getId(),
        data: {
          values: [],
          variants: [
            {
              culture: null,
              segment: null,
              name: UPDATED_ELEMENT_NAME,
            },
          ],
        },
      },
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();

    const found = await ElementTestHelper.findElement(UPDATED_ELEMENT_NAME);
    expect(found).toBeDefined();
    expect(found!.id).toBe(builder.getId());
  });

  it("should handle non-existent element", async () => {
    const result = await UpdateElementTool.handler(
      {
        id: BLANK_UUID,
        data: {
          values: [],
          variants: [
            {
              culture: null,
              segment: null,
              name: UPDATED_ELEMENT_NAME,
            },
          ],
        },
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
  });
});
