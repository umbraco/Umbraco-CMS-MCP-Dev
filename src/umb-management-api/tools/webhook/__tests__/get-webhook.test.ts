import GetWebhookTool from "../get/get-webhook.js";
import { WebhookBuilder } from "./helpers/webhook-builder.js";
import { WebhookTestHelper } from "./helpers/webhook-helper.js";
import { createMockRequestHandlerExtra, validateStructuredContent } from "@/test-helpers/create-mock-request-handler-extra.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { getWebhookResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  CONTENT_PUBLISHED_EVENT,
  TEST_WEBHOOOK_URL,
} from "./webhook-constants.js";

describe("get-webhook", () => {
  const TEST_WEBHOOK_NAME = "_Test Webhook";

  setupTestEnvironment();

  afterEach(async () => {
    await WebhookTestHelper.cleanup(TEST_WEBHOOK_NAME);
  });

  it("should get empty paged webhooks", async () => {
    // Get paged webhooks
    const result = await GetWebhookTool.handler(
      { skip: 0, take: 10 },
      createMockRequestHandlerExtra()
    );
    const response = validateStructuredContent(result, getWebhookResponse);

    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response.items)).toBe(true);
    expect(response).toMatchSnapshot();
  });

  it("should get paged webhooks with created webhook", async () => {
    // Create a webhook
    const builder = await new WebhookBuilder()
      .withName(TEST_WEBHOOK_NAME)
      .withUrl(TEST_WEBHOOOK_URL)
      .withEvents([CONTENT_PUBLISHED_EVENT])
      .create();

    // Get paged webhooks
    const result = await GetWebhookTool.handler(
      { skip: 0, take: 10 },
      createMockRequestHandlerExtra()
    );
    const response = validateStructuredContent(result, getWebhookResponse);

    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response.items)).toBe(true);
    expect(response.total).toBeGreaterThanOrEqual(1);
    expect(response.items.length).toBeGreaterThanOrEqual(1);

    // Find our webhook in the results
    const ourWebhook = response.items.find((item: any) => item.name === TEST_WEBHOOK_NAME);
    expect(ourWebhook).toBeDefined();
    expect(ourWebhook?.name).toBe(TEST_WEBHOOK_NAME);

    // Use createSnapshotResult for normalization
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should use pagination parameters", async () => {
    // Get webhooks with pagination parameters
    const result = await GetWebhookTool.handler(
      { skip: 0, take: 100 },
      createMockRequestHandlerExtra()
    );
    const response = validateStructuredContent(result, getWebhookResponse);

    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response.items)).toBe(true);
    expect(response).toMatchSnapshot();
  });
});
