import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import GetDocumentSiblingsTool from "../items/get/get-siblings.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_PARENT_NAME = "_Test Siblings Parent";
const TEST_SIBLING_1_NAME = "_Test Sibling 1";
const TEST_SIBLING_2_NAME = "_Test Sibling 2";

describe("get-document-siblings", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_SIBLING_1_NAME);
    await DocumentTestHelper.cleanup(TEST_SIBLING_2_NAME);
    await DocumentTestHelper.cleanup(TEST_PARENT_NAME);
  });

  it("should get sibling documents", async () => {
    // Arrange - Create parent and two siblings
    const parentBuilder = await new DocumentBuilder()
      .withName(TEST_PARENT_NAME)
      .withRootDocumentType()
      .create();

    const sibling1Builder = await new DocumentBuilder()
      .withName(TEST_SIBLING_1_NAME)
      .withContentDocumentType()
      .withParent(parentBuilder.getId())
      .create();

    await new DocumentBuilder()
      .withName(TEST_SIBLING_2_NAME)
      .withContentDocumentType()
      .withParent(parentBuilder.getId())
      .create();

    // Act - Get siblings of first sibling
    const result = await GetDocumentSiblingsTool.handler(
      {
        target: sibling1Builder.getId(),
        after: 100,
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle non-existent target", async () => {
    // Act
    const result = await GetDocumentSiblingsTool.handler(
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
