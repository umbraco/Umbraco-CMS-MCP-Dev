import UpdateAndPublishElementTool from "../put/update-and-publish-element.js";
import { ElementBuilder, ElementTypeRegistry } from "./helpers/element-builder.js";
import { ElementTestHelper } from "./helpers/element-test-helper.js";
import { BLANK_UUID } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ELEMENT_NAME = "_Test UpdateAndPublishElement";
const UPDATED_ELEMENT_NAME = "_Test UpdateAndPublishElement Updated";

describe("update-and-publish-element", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await ElementTestHelper.cleanup(TEST_ELEMENT_NAME);
    await ElementTestHelper.cleanup(UPDATED_ELEMENT_NAME);
  });

  afterAll(async () => {
    await ElementTypeRegistry.deleteElementType();
  });

  it("should update and publish an invariant element with an empty culturesToPublish array", async () => {
    // Arrange: create an unpublished invariant element.
    const builder = await new ElementBuilder()
      .withName(TEST_ELEMENT_NAME)
      .create();

    // Umbraco only accepts real culture codes for culturesToPublish (wildcards/nulls are
    // rejected). For invariant content, an empty array publishes the invariant variant.
    const result = await UpdateAndPublishElementTool.handler(
      {
        id: builder.getId(),
        data: {
          culturesToPublish: [],
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

    // Assert
    expect(result).toMatchSnapshot();

    const found = await ElementTestHelper.findElement(UPDATED_ELEMENT_NAME);
    expect(found).toBeDefined();
    expect(found!.id).toBe(builder.getId());
    const isPublished = found!.variants.some((v) => v.state === "Published");
    expect(isPublished).toBe(true);
  });

  it("should handle updating and publishing a non-existent element", async () => {
    const result = await UpdateAndPublishElementTool.handler(
      {
        id: BLANK_UUID,
        data: {
          culturesToPublish: [],
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
