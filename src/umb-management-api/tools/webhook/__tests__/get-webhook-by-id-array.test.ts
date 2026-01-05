import GetWebhookItemTool from "../get/get-webhook-by-id-array.js";
import { WebhookBuilder } from "./helpers/webhook-builder.js";
import { WebhookTestHelper } from "./helpers/webhook-helper.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import {
  CONTENT_DELETED_EVENT,
  CONTENT_PUBLISHED_EVENT,
  TEST_WEBHOOOK_URL,
} from "./webhook-constants.js";

describe("get-webhook-item", () => {
  const TEST_WEBHOOK_NAME = "_Test Item Webhook";
  const TEST_WEBHOOK_NAME_2 = "_Test Item Webhook2";

  setupTestEnvironment();

  afterEach(async () => {
    await WebhookTestHelper.cleanup(TEST_WEBHOOK_NAME);
    await WebhookTestHelper.cleanup(TEST_WEBHOOK_NAME_2);
  });

  it("should get no webhooks for empty request", async () => {
    // Get all webhooks
    const result = await GetWebhookItemTool.handler(
      {},
      createMockRequestHandlerExtra()
    );
    const items = (result.structuredContent as any)?.items ?? [];

    expect(items).toMatchSnapshot();
  });

  it("should get single webhook by ID", async () => {
    // Create a webhook
    const builder = await new WebhookBuilder()
      .withName(TEST_WEBHOOK_NAME)
      .withUrl(TEST_WEBHOOOK_URL)
      .withEvents([CONTENT_PUBLISHED_EVENT])
      .create();

    // Get by ID
    const result = await GetWebhookItemTool.handler(
      { id: [builder.getId()] },
      createMockRequestHandlerExtra()
    );
    const items = (result.structuredContent as any)?.items ?? [];
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe(TEST_WEBHOOK_NAME);
    // Use createSnapshotResult for normalization
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should get multiple webhooks by ID", async () => {
    // Create first webhook
    const builder1 = await new WebhookBuilder()
      .withName(TEST_WEBHOOK_NAME)
      .withUrl("https://example.com/webhook1")
      .withEvents([CONTENT_PUBLISHED_EVENT])
      .create();

    // Create second webhook
    const builder2 = await new WebhookBuilder()
      .withName(TEST_WEBHOOK_NAME_2)
      .withUrl("https://example.com/webhook2")
      .withEvents([CONTENT_DELETED_EVENT])
      .create();

    // Get by IDs
    const result = await GetWebhookItemTool.handler(
      {
        id: [builder1.getId(), builder2.getId()],
      },
      createMockRequestHandlerExtra()
    );

    const items = (result.structuredContent as any)?.items ?? [];
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe(TEST_WEBHOOK_NAME);
    expect(items[1].name).toBe(TEST_WEBHOOK_NAME_2);

    // Use createSnapshotResult for normalization
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
