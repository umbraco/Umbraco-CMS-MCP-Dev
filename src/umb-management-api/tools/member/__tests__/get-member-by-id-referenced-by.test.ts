import GetMemberByIdReferencedByTool from "../get/get-member-by-id-referenced-by.js";
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

const TEST_MEMBER_NAME = "_Test Member Referenced By";
const TEST_MEMBER_EMAIL = "test-referenced-by@example.com";
const TEST_DOCUMENT_TYPE_NAME = "_Test DocType With Member Ref";
const TEST_DOCUMENT_NAME = "_Test Document With Member Ref";

describe("get-member-by-id-referenced-by", () => {
  setupTestEnvironment();

  afterEach(async () => {
    // Clean up in parallel to speed up tests
    await Promise.all([
      MemberTestHelper.cleanup(TEST_MEMBER_EMAIL),
      DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME),
      DocumentTypeTestHelper.cleanup(TEST_DOCUMENT_TYPE_NAME)
    ]);
  });

  it("should get reference data for a specific member", async () => {
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

    const result = await GetMemberByIdReferencedByTool.handler(
      { id: memberBuilder.getId(), skip: 0, take: 10 },
      createMockRequestHandlerExtra()
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Validate response against tool's output schema
    const parsed = validateToolResponse(GetMemberByIdReferencedByTool, result);
    expect(parsed).toHaveProperty('total');
    expect(parsed).toHaveProperty('items');
    expect(Array.isArray(parsed.items)).toBe(true);
    expect(typeof parsed.total).toBe('number');
  });

  it("should return empty results when member has no references", async () => {
    // Create a member that will NOT be referenced
    const memberBuilder = await new MemberBuilder()
      .withName(TEST_MEMBER_NAME + "_Unreferenced")
      .withEmail("unreferenced_" + TEST_MEMBER_EMAIL)
      .withUsername("unreferenced_" + TEST_MEMBER_EMAIL)
      .withPassword("test123@Longer")
      .withMemberType(Default_Memeber_TYPE_ID)
      .create();

    const result = await GetMemberByIdReferencedByTool.handler(
      { id: memberBuilder.getId(), skip: 0, take: 10 },
      createMockRequestHandlerExtra()
    );

    const normalizedResult = createSnapshotResult(result);
    expect(normalizedResult).toMatchSnapshot();

    // Validate response against tool's output schema
    const parsed = validateToolResponse(GetMemberByIdReferencedByTool, result);
    expect(parsed.total).toBe(0);
    expect(parsed.items).toHaveLength(0);

    // Cleanup the unreferenced member
    await MemberTestHelper.cleanup("unreferenced_" + TEST_MEMBER_EMAIL);
  });
});