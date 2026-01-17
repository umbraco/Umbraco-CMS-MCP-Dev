import PutDocumentNotificationsTool from "../put/put-document-notifications.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import GetDocumentNotificationsTool from "../get/get-document-notifications.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCUMENT_NAME = "_Test PutNotificationsDocument";
const TEST_NOTIFICATION = "_TEST_ACTIONSAVE";

describe("put-document-notifications", () => {
  setupTestEnvironment();

  let docId: string;

  beforeEach(async () => {
    // Create a document
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();
    docId = builder.getId();
  });

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
  });

  it("should add a notification for a valid document", async () => {
    // Add notification
    const result = await PutDocumentNotificationsTool.handler(
      {
        id: docId,
        data: { subscribedActionIds: [TEST_NOTIFICATION] },
      },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();

    // Get notifications to verify
    const getResult = await GetDocumentNotificationsTool.handler(
      {
        id: docId,
      },
      createMockRequestHandlerExtra()
    );
    expect(getResult).toMatchSnapshot();
  });

  it("should handle non-existent document", async () => {
    const result = await PutDocumentNotificationsTool.handler(
      {
        id: BLANK_UUID,
        data: { subscribedActionIds: [TEST_NOTIFICATION] },
      },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
  });
});
