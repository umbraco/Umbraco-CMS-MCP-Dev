import GetWebhookLogsTool from "../get/get-webhook-logs-by-id.js";
import { WebhookBuilder } from "./helpers/webhook-builder.js";
import { CONTENT_PUBLISHED_EVENT, TEST_WEBHOOOK_URL } from "./webhook-constants.js";
import { encodeCursor } from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
  type CursorPaginatedResult,
} from "@umbraco-cms/mcp-server-sdk/testing";

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

  it("should accept a cursor and return a valid paginated structure", async () => {
    await builder
      .withName(TEST_WEBHOOK_NAME)
      .withUrl(TEST_WEBHOOOK_URL)
      .withEvents([CONTENT_PUBLISHED_EVENT])
      .create();

    // A cursor with a skip beyond any possible log count should come back empty but valid
    const result = await GetWebhookLogsTool.handler(
      { id: builder.getId(), cursor: encodeCursor({ s: 10000, t: 100 }) },
      createMockRequestHandlerExtra()
    );

    const parsed = validateToolResponse(GetWebhookLogsTool, result) as CursorPaginatedResult;
    expect(parsed.items).toHaveLength(0);
    expect(typeof parsed.total).toBe("number");
    expect(parsed.nextCursor).toBeFalsy();
  });

  it("should respect a small requested page size without erroring when there are no logs yet", async () => {
    await builder
      .withName(TEST_WEBHOOK_NAME)
      .withUrl(TEST_WEBHOOOK_URL)
      .withEvents([CONTENT_PUBLISHED_EVENT])
      .create();

    // Request a page size of 1 via a crafted cursor
    const result = await GetWebhookLogsTool.handler(
      { id: builder.getId(), cursor: encodeCursor({ s: 0, t: 1 }) },
      createMockRequestHandlerExtra()
    );

    const parsed = validateToolResponse(GetWebhookLogsTool, result) as CursorPaginatedResult;
    expect(Array.isArray(parsed.items)).toBe(true);
    expect(parsed.items.length).toBeLessThanOrEqual(1);
    expect(typeof parsed.total).toBe("number");
  });
});
