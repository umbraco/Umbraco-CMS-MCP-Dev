import { WebhookTestHelper } from "./helpers/webhook-helper.js";
import CreateWebhookTool from "../post/create-webhook.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { createSnapshotResult, normalizeErrorResponse } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { WebhookBuilder } from "./helpers/webhook-builder.js";
import { CONTENT_PUBLISHED_EVENT, TEST_WEBHOOOK_URL } from "./webhook-constants.js";

describe("create-webhook", () => {
  const TEST_WEBHOOK_NAME = "_Test Webhook";

  setupTestEnvironment();

  afterEach(async () => {
    await WebhookTestHelper.cleanup(TEST_WEBHOOK_NAME);
  });

  it("should create a webhook", async () => {
    const builder = new WebhookBuilder()
      .withName(TEST_WEBHOOK_NAME)
      .withUrl(TEST_WEBHOOOK_URL)
      .withEvents([CONTENT_PUBLISHED_EVENT]);

    const result = await CreateWebhookTool.handler(
      builder.build() as Parameters<typeof CreateWebhookTool.handler>[0],
      createMockRequestHandlerExtra()
    );

    const responseData = validateToolResponse(CreateWebhookTool, result);
    expect(responseData.message).toBe("Webhook created successfully");
    expect(createSnapshotResult(result, responseData.id)).toMatchSnapshot();

    const items = await WebhookTestHelper.findWebhook(TEST_WEBHOOK_NAME);
    expect(items).not.toBeNull();
    expect(items?.name).toBe(TEST_WEBHOOK_NAME);
    expect(items?.url).toBe(TEST_WEBHOOOK_URL);
  });

  it("should handle invalid webhook data", async () => {
    const invalidModel = {
      name: TEST_WEBHOOK_NAME,
      // Missing required URL field
    };

    const result = await CreateWebhookTool.handler(invalidModel as any, createMockRequestHandlerExtra());

    expect(result.isError).toBe(true);
    expect(normalizeErrorResponse(result)).toMatchSnapshot();
  });
});
