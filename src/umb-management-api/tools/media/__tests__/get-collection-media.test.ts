import GetCollectionMediaTool from "../get/get-collection-media.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_MEDIA_NAME = "_Test Collection Media";
const TEST_MEDIA_NAME_2 = "_Test Collection Media 2";

describe("get-collection-media", () => {
  setupTestEnvironment();
  let tempFileBuilder: TemporaryFileBuilder;
  let tempFileBuilder2: TemporaryFileBuilder;

  beforeEach(async () => {
    tempFileBuilder = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();

    tempFileBuilder2 = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();
  });

  afterEach(async () => {
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME);
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME_2);
  });

  it("should get a collection of media items", async () => {
    // Create multiple media items
    await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    await new MediaBuilder()
      .withName(TEST_MEDIA_NAME_2)
      .withImageMediaType()
      .withImageValue(tempFileBuilder2.getId())
      .create();

    const result = await GetCollectionMediaTool.handler(
      {
        orderBy: "updateDate",
        take: 100,
        skip: 0
      } as any,
      createMockRequestHandlerExtra()
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle filtering by media type", async () => {
    // Create a media item
    await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    const result = await GetCollectionMediaTool.handler(
      {
        orderBy: "name",
        take: 10
      } as any,
      createMockRequestHandlerExtra()
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle pagination parameters", async () => {
    // Create a media item
    await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    const result = await GetCollectionMediaTool.handler(
      {
        skip: 0,
        take: 5,
        orderBy: "updateDate"
      } as any,
      createMockRequestHandlerExtra()
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle ordering direction", async () => {
    // Create a media item
    await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    const result = await GetCollectionMediaTool.handler(
      {
        orderBy: "name",
        orderDirection: "Descending",
        take: 10
      } as any,
      createMockRequestHandlerExtra()
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle filtering by name", async () => {
    // Create a media item with specific name
    await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();

    const result = await GetCollectionMediaTool.handler(
      {
        filter: "Test Collection",
        orderBy: "name",
        take: 10
      } as any,
      createMockRequestHandlerExtra()
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });

  it("should handle non-existent data type ID", async () => {
    const result = await GetCollectionMediaTool.handler(
      {
        dataTypeId: BLANK_UUID,
        orderBy: "name",
        take: 10
      } as any,
      createMockRequestHandlerExtra()
    );

    expect(result).toMatchSnapshot();
  });

  it("should use default values when minimal parameters provided", async () => {
    const result = await GetCollectionMediaTool.handler(
      {
        orderBy: "updateDate", // Using default orderBy value
        take: 100
      } as any,
      createMockRequestHandlerExtra()
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();
  });
});
