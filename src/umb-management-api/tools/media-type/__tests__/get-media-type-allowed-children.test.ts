import GetMediaTypeAllowedChildrenTool from "../get/get-media-type-allowed-children.js";
import { MediaTypeBuilder } from "./helpers/media-type-builder.js";
import { MediaTypeTestHelper } from "./helpers/media-type-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";

describe("get-media-type-allowed-children", () => {
  setupTestEnvironment();

  const TEST_PARENT_NAME = "_Test Parent MediaType";
  const TEST_CHILD_NAME = "_Test Child MediaType";

  afterEach(async () => {
    // Clean up any test media types
    await MediaTypeTestHelper.cleanup(TEST_PARENT_NAME);
    await MediaTypeTestHelper.cleanup(TEST_CHILD_NAME);
  });

  it("should get allowed children for a media type", async () => {
    // Create child media type
    const childBuilder = await new MediaTypeBuilder()
      .withName(TEST_CHILD_NAME)
      .withIcon("icon-picture")
      .create();

    // Create parent media type with child allowed
    const parentBuilder = await new MediaTypeBuilder()
      .withName(TEST_PARENT_NAME)
      .withIcon("icon-picture")
      .withAllowedMediaType(childBuilder.getId())
      .create();

    // Get allowed children
    const result = await GetMediaTypeAllowedChildrenTool.handler(
      {
        id: parentBuilder.getId(),
        skip: 0,
        take: 100,
      } as any,
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's output schema
    const response = validateToolResponse(GetMediaTypeAllowedChildrenTool, result);

    // Verify the response contains our child media type
    const foundChild = response.items.find(
      (item: any) => item.name === TEST_CHILD_NAME
    );
    expect(foundChild).toBeDefined();
    expect(foundChild!.name).toBe(TEST_CHILD_NAME);

    // Verify the total count
    expect(response.total).toBe(1);

    // Create normalized snapshot for API response structure verification
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle non-existent media type", async () => {
    const result = await GetMediaTypeAllowedChildrenTool.handler(
      {
        id: BLANK_UUID,
        skip: 0,
        take: 100,
      } as any,
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });

  it("should handle media type with no allowed children", async () => {
    // Create parent media type with no allowed children
    const parentBuilder = await new MediaTypeBuilder()
      .withName(TEST_PARENT_NAME)
      .create();

    const result = await GetMediaTypeAllowedChildrenTool.handler(
      {
        id: parentBuilder.getId(),
        skip: 0,
        take: 100,
      } as any,
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's output schema
    const response = validateToolResponse(GetMediaTypeAllowedChildrenTool, result);
    expect(response.total).toBe(0);
    expect(response.items).toHaveLength(0);

    // Create normalized snapshot for API response structure verification
    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
