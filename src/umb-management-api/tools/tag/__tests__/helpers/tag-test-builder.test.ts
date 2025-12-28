import { TagTestBuilder } from "./tag-test-builder.js";
import { DocumentTypeBuilder } from "../../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DocumentBuilder } from "../../../document/__tests__/helpers/document-builder.js";
import { DocumentTestHelper } from "../../../document/__tests__/helpers/document-test-helper.js";
import { TAG_DATA_TYPE_ID, BLANK_UUID } from "@/constants/constants.js";
import { jest } from "@jest/globals";

const TEST_DOCUMENT_NAME = "_Test Tag Builder Document";
const TEST_TAG_1 = "builder-test-tag";

describe("TagTestBuilder", () => {
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    // Clean up test documents
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should build tag search model with query and tagGroup", () => {
    const builder = new TagTestBuilder()
      .withQuery("test")
      .withTagGroup("default");

    const model = builder.build();

    expect(model).toMatchSnapshot();
  });


  it("should find specific tag", async () => {
    // Create test document with tags first
    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .allowAsRoot(true)
      .withProperty("tag", "Tag", TAG_DATA_TYPE_ID)
      .create();

    const documentBuilder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(docTypeBuilder.getId())
      .withValue("tag", [TEST_TAG_1])
      .create();

    await documentBuilder.publish();

    const builder = new TagTestBuilder();
    const foundTag = await builder.findTag(TEST_TAG_1);

    // Normalize the tag ID for snapshot testing
    const normalizedTag = foundTag ? { ...foundTag, id: BLANK_UUID } : foundTag;
    expect(normalizedTag).toMatchSnapshot();
  });
  
});