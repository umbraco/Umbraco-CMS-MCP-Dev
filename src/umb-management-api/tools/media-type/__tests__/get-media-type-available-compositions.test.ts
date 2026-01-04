import GetMediaTypeAvailableCompositionsTool from "../post/get-media-type-available-compositions.js";
import { MediaTypeBuilder } from "./helpers/media-type-builder.js";
import { MediaTypeTestHelper } from "./helpers/media-type-helper.js";
import { MediaTypeCompositionResponseModel } from "@/umb-management-api/schemas/index.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_MEDIA_TYPE_NAME = "_Test MediaType Available";
const TEST_COMPOSITION_NAME = "_Test Available Composition";

describe("get-media-type-available-compositions", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up any test media types
    await MediaTypeTestHelper.cleanup(TEST_MEDIA_TYPE_NAME);
    await MediaTypeTestHelper.cleanup(TEST_COMPOSITION_NAME);
  });

  it("should get available compositions for a media type", async () => {
    // Create a media type that will be available as a composition
    await new MediaTypeBuilder().withName(TEST_COMPOSITION_NAME).create();

    // Create a media type to test available compositions for
    const mediaTypeBuilder = await new MediaTypeBuilder()
      .withName(TEST_MEDIA_TYPE_NAME)
      .create();

    // Get the available compositions
    const result = await GetMediaTypeAvailableCompositionsTool.handler(
      {
        id: mediaTypeBuilder.getId(),
        currentPropertyAliases: [],
        currentCompositeIds: [],
      } as any,
      createMockRequestHandlerExtra()
    );

    // Parse and filter just our test composition
    const items = ((result.structuredContent as any)?.items ?? []) as MediaTypeCompositionResponseModel[];
    const testComposition = items.find(
      (item) => item.name === TEST_COMPOSITION_NAME
    );

    if (!testComposition) {
      throw new Error("Test composition not found in results");
    }

    testComposition.id = BLANK_UUID;

    // Verify just the test composition
    expect(testComposition).toMatchSnapshot();
  });
});
