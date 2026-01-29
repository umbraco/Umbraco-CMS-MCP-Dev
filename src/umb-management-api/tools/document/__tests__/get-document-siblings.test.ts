import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import GetDocumentSiblingsTool from "../items/get/get-siblings.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

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
        before: undefined,
        after: 100,
        dataTypeId: undefined,
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
        before: undefined,
        after: 100,
        dataTypeId: undefined,
      },
      createMockRequestHandlerExtra()
    );

    // Assert
    expect(result).toMatchSnapshot();
  });
});
