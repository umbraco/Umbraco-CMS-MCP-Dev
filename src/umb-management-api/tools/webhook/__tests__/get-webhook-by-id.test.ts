import { WebhookTestHelper } from "./helpers/webhook-helper.js";
import GetWebhookByIdTool from "../get/get-webhook-by-id.js";
import { WebhookBuilder } from "./helpers/webhook-builder.js";
import {
  CONTENT_DELETED_EVENT,
  CONTENT_PUBLISHED_EVENT,
  TEST_WEBHOOOK_URL,
} from "./webhook-constants.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-webhook-by-id", () => {
  const TEST_WEBHOOK_NAME = "_Test Webhook";

  setupTestEnvironment();

  afterEach(async () => {
    await WebhookTestHelper.cleanup(TEST_WEBHOOK_NAME);
  });

  it("should get a webhook by id", async () => {
    // Create a webhook first
    const builder = await new WebhookBuilder()
      .withName(TEST_WEBHOOK_NAME)
      .withUrl(TEST_WEBHOOOK_URL)
      .withEvents([CONTENT_PUBLISHED_EVENT, CONTENT_DELETED_EVENT])
      .create();

    const result = await GetWebhookByIdTool.handler(
      {
        id: builder.getId(),
      },
      createMockRequestHandlerExtra()
    );

    // Normalize and verify response
    expect(createSnapshotResult(result, builder.getId())).toMatchSnapshot();
  });

  it("should handle non-existent webhook", async () => {
    const result = await GetWebhookByIdTool.handler(
      {
        id: BLANK_UUID,
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
