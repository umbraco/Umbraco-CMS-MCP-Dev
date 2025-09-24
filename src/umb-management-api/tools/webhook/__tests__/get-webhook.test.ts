import GetWebhookTool from "../get/get-webhook.js";
import { WebhookBuilder } from "./helpers/webhook-builder.js";
import { WebhookTestHelper } from "./helpers/webhook-helper.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";
import {
  CONTENT_PUBLISHED_EVENT,
  TEST_WEBHOOOK_URL,
} from "./webhook-constants.js";

describe("get-webhook", () => {
  const TEST_WEBHOOK_NAME = "_Test Webhook";
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await WebhookTestHelper.cleanup(TEST_WEBHOOK_NAME);
  });

  it("should get empty paged webhooks", async () => {
    // Get paged webhooks
    const result = await GetWebhookTool().handler(
      { skip: 0, take: 10 },
      { signal: new AbortController().signal }
    );
    const response = JSON.parse(result.content[0].text as string);

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
    const result = await GetWebhookTool().handler(
      { skip: 0, take: 10 },
      { signal: new AbortController().signal }
    );
    const response = JSON.parse(result.content[0].text as string);

    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response.items)).toBe(true);
    expect(response.total).toBeGreaterThanOrEqual(1);
    expect(response.items.length).toBeGreaterThanOrEqual(1);

    // Find our webhook in the results
    const ourWebhook = response.items.find((item: any) => item.name === TEST_WEBHOOK_NAME);
    expect(ourWebhook).toBeDefined();
    expect(ourWebhook.name).toBe(TEST_WEBHOOK_NAME);

    // Normalize IDs for snapshot
    response.items.forEach((item: any) => {
      item.id = BLANK_UUID;
    });
    expect(response).toMatchSnapshot();
  });

  it("should use pagination parameters", async () => {
    // Get webhooks with pagination parameters
    const result = await GetWebhookTool().handler(
      { skip: 0, take: 100 },
      { signal: new AbortController().signal }
    );
    const response = JSON.parse(result.content[0].text as string);

    expect(response).toHaveProperty('total');
    expect(response).toHaveProperty('items');
    expect(Array.isArray(response.items)).toBe(true);
    expect(response).toMatchSnapshot();
  });
});