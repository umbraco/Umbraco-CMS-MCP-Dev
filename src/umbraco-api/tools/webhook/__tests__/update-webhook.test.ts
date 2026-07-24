import { WebhookTestHelper } from "./helpers/webhook-helper.js";
import UpdateWebhookTool from "../put/update-webhook.js";
import { WebhookBuilder } from "./helpers/webhook-builder.js";
import {
  CONTENT_PUBLISHED_EVENT,
  CONTENT_UNPUBLISHED_EVENT,
  TEST_WEBHOOOK_URL,
} from "./webhook-constants.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_WEBHOOK_NAME = "_Test Webhook Update";
const UPDATED_WEBHOOK_NAME = "_Updated Webhook";
const NON_EXISTENT_WEBHOOK_NAME = "_Non Existent Webhook";

describe("update-webhook", () => {
  setupTestEnvironment();
  let builder: WebhookBuilder;

  beforeEach(() => {
    builder = new WebhookBuilder();
  });

  afterEach(async () => {
    await builder.cleanup();
    await WebhookTestHelper.cleanup(UPDATED_WEBHOOK_NAME);
  });

  it("should update a webhook", async () => {
    await builder
      .withName(TEST_WEBHOOK_NAME)
      .withUrl(TEST_WEBHOOOK_URL)
      .withEvents([CONTENT_PUBLISHED_EVENT])
      .create();

    const model = builder
      .withName(UPDATED_WEBHOOK_NAME)
      .withUrl("https://example.com/updated-webhook")
      .withEvents([CONTENT_UNPUBLISHED_EVENT])
      .build();

    const result = await UpdateWebhookTool.handler(
      {
        id: builder.getId(),
        data: model,
      },
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBeFalsy();
    expect(result).toMatchSnapshot();

    // Verify the webhook was updated
    const foundWebhook = await WebhookTestHelper.findWebhook(
      UPDATED_WEBHOOK_NAME
    );
    expect(foundWebhook).not.toBeNull();
    expect(foundWebhook?.url).toBe("https://example.com/updated-webhook");
    expect(foundWebhook?.events).toEqual([
      {
        alias: CONTENT_UNPUBLISHED_EVENT,
        eventName: CONTENT_UNPUBLISHED_EVENT,
        eventType: "Other",
      },
    ]);
  });

  it("should handle non-existent webhook", async () => {
    const model = builder
      .withName(NON_EXISTENT_WEBHOOK_NAME)
      .withUrl("https://example.com/webhook")
      .withEvents([CONTENT_PUBLISHED_EVENT])
      .build();

    const result = await UpdateWebhookTool.handler(
      {
        id: BLANK_UUID,
        data: model,
      },
      createMockRequestHandlerExtra()
    );
    expect(result.isError).toBe(true);
    expect(result).toMatchSnapshot();
  });
});
