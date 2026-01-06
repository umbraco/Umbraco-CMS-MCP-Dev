import GetMemberAreReferencedTool from "../get/get-member-are-referenced.js";
import { MemberBuilder } from "./helpers/member-builder.js";
import { MemberTestHelper } from "./helpers/member-test-helper.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { Default_Memeber_TYPE_ID, MEMBER_PICKER_DATA_TYPE_ID } from "../../../../constants/constants.js";
import { DocumentTypeBuilder } from "../../document-type/__tests__/helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "../../document-type/__tests__/helpers/document-type-test-helper.js";
import { DocumentBuilder } from "../../document/__tests__/helpers/document-builder.js";
import { DocumentTestHelper } from "../../document/__tests__/helpers/document-test-helper.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";

const TEST_MEMBER_NAME = "_Test Member Are Referenced";
const TEST_MEMBER_EMAIL = "test-are-referenced@example.com";
const TEST_DOCUMENT_TYPE_NAME = "_Test DocType Member Are Ref";
const TEST_DOCUMENT_NAME = "_Test Document Member Are Ref";

describe("get-member-are-referenced", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up in parallel to speed up tests
    await Promise.all([
      MemberTestHelper.cleanup(TEST_MEMBER_EMAIL),
      MemberTestHelper.cleanup("test1_" + TEST_MEMBER_EMAIL),
      MemberTestHelper.cleanup("test2_" + TEST_MEMBER_EMAIL),
      DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME),
      DocumentTypeTestHelper.cleanup(TEST_DOCUMENT_TYPE_NAME)
    ]);
  }, 15000);

  it("should check member references using real member picker", async () => {
    // Create a member that will be referenced
    const memberBuilder = await new MemberBuilder()
      .withName(TEST_MEMBER_NAME)
      .withEmail(TEST_MEMBER_EMAIL)
      .withUsername(TEST_MEMBER_EMAIL)
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();

    // Create a document type with a member picker property
    const docTypeBuilder = await new DocumentTypeBuilder()
      .withName(TEST_DOCUMENT_TYPE_NAME)
      .allowAsRoot(true)
      .withProperty("memberPicker", "Member Picker", MEMBER_PICKER_DATA_TYPE_ID)
      .create();

    // Create a document that references the member via member picker
    await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withDocumentType(docTypeBuilder.getId())
      .withValue("memberPicker", memberBuilder.getId())
      .create();

    const result = await GetMemberAreReferencedTool.handler(
      { id: [memberBuilder.getId()], skip: 0, take: 10 },
      createMockRequestHandlerExtra()
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Validate response against tool's output schema
    const parsed = validateToolResponse(GetMemberAreReferencedTool, result);
    expect(parsed).toHaveProperty('total');
    expect(parsed).toHaveProperty('items');
    expect(Array.isArray(parsed.items)).toBe(true);
    expect(typeof parsed.total).toBe('number');
  });

  it("should handle multiple member IDs with no tracked references", async () => {
    // Create two members for testing
    const builder1 = await new MemberBuilder()
      .withName(TEST_MEMBER_NAME + "_1")
      .withEmail("test1_" + TEST_MEMBER_EMAIL)
      .withUsername("test1_" + TEST_MEMBER_EMAIL)
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();

    const builder2 = await new MemberBuilder()
      .withName(TEST_MEMBER_NAME + "_2")
      .withEmail("test2_" + TEST_MEMBER_EMAIL)
      .withUsername("test2_" + TEST_MEMBER_EMAIL)
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();

    const result = await GetMemberAreReferencedTool.handler(
      { id: [builder1.getId(), builder2.getId()], skip: 0, take: 10 },
      createMockRequestHandlerExtra()
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Validate response against tool's output schema
    const parsed = validateToolResponse(GetMemberAreReferencedTool, result);
    expect(parsed.total).toBe(0);
    expect(parsed.items).toHaveLength(0);
    expect(Array.isArray(parsed.items)).toBe(true);
  });
});