import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import GetDocumentRecycleBinSiblingsTool from "../items/get/get-recycle-bin-siblings.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_PARENT_NAME = "_Test RecycleBin Siblings Parent";
const TEST_SIBLING_1_NAME = "_Test RecycleBin Sibling 1";
const TEST_SIBLING_2_NAME = "_Test RecycleBin Sibling 2";

describe("get-document-recycle-bin-siblings", () => {

  setupTestEnvironment();

  beforeEach(async () => {
    await DocumentTestHelper.emptyRecycleBin();
  });

  afterEach(async () => {
    await DocumentTestHelper.emptyRecycleBin();
  });

  it("should get sibling documents in recycle bin", async () => {
    // Arrange - Create parent and two siblings, move all to recycle bin
    const parentBuilder = await new DocumentBuilder()
      .withName(TEST_PARENT_NAME)
      .withRootDocumentType()
      .create();

    const sibling1Builder = await new DocumentBuilder()
      .withName(TEST_SIBLING_1_NAME)
      .withContentDocumentType()
      .withParent(parentBuilder.getId())
      .create();

    const sibling2Builder = await new DocumentBuilder()
      .withName(TEST_SIBLING_2_NAME)
      .withContentDocumentType()
      .withParent(parentBuilder.getId())
      .create();

    // Move all to recycle bin (children first, then parent)
    await sibling2Builder.moveToRecycleBin();
    await sibling1Builder.moveToRecycleBin();
    await parentBuilder.moveToRecycleBin();

    // Find sibling1 in recycle bin to get its ID
    const sibling1InBin = await DocumentTestHelper.findDocumentInRecycleBin(
      TEST_SIBLING_1_NAME
    );
    expect(sibling1InBin).toBeDefined();

    // Act - Get siblings of first sibling in recycle bin
    const result = await GetDocumentRecycleBinSiblingsTool.handler(
      {
        target: sibling1InBin!.id,
        after: 100,
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent target in recycle bin", async () => {
    // Act
    const result = await GetDocumentRecycleBinSiblingsTool.handler(
      {
        target: BLANK_UUID,
        after: 100,
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
