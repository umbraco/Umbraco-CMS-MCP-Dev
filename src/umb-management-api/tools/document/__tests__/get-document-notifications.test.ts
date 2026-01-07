import GetDocumentNotificationsTool from "../get/get-document-notifications.js";
import PutDocumentNotificationsTool from "../put/put-document-notifications.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { BLANK_UUID } from "@/constants/constants.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

const TEST_DOCUMENT_NAME = "_Test NotificationsDocument";
const TEST_NOTIFICATION = "ACTIONSAVE";

describe("get-document-notifications", () => {
  setupTestEnvironment();

  let docId: string;

  beforeEach(async () => {
    // Create a document
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();
    docId = builder.getId();
    // Add a notification
    await PutDocumentNotificationsTool.handler(
      {
        id: docId,
        data: { subscribedActionIds: [TEST_NOTIFICATION] },
      },
      createMockRequestHandlerExtra()
    );
  });

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should add and then get notifications for a valid document", async () => {
    const result = await GetDocumentNotificationsTool.handler(
      {
        id: docId,
      },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
  });

  it("should handle non-existent document", async () => {
    const result = await GetDocumentNotificationsTool.handler(
      {
        id: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
  });
});
