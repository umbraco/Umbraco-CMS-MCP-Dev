import GetWebhookLogsTool from "../get/get-webhook-logs-by-id.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { WebhookBuilder } from "./helpers/webhook-builder.js";
import { CONTENT_PUBLISHED_EVENT, TEST_WEBHOOOK_URL } from "./webhook-constants.js";

const TEST_WEBHOOK_NAME = "_Test Webhook Logs";

describe("get-webhook-logs", () => {
  setupTestEnvironment();
  let builder: WebhookBuilder;

  beforeEach(() => {
    builder = new WebhookBuilder();
  });

  afterEach(async () => {
    await builder.cleanup();
  });

  it("should get logs for a webhook", async () => {
    // Create a webhook first
    await builder
      .withName(TEST_WEBHOOK_NAME)
      .withUrl(TEST_WEBHOOOK_URL)
      .withEvents([CONTENT_PUBLISHED_EVENT])
      .create();

    const result = await GetWebhookLogsTool.handler({
      id: builder.getId()
    }, createMockRequestHandlerExtra());

    expect(result).toMatchSnapshot();
  });
});
