import { jest } from "@jest/globals";
import GetWebhookLogsTool from "../get/get-webhook-logs-by-id.js";
import { WebhookBuilder } from "./helpers/webhook-builder.js";
import { CONTENT_PUBLISHED_EVENT, TEST_WEBHOOOK_URL } from "./webhook-constants.js";
import { encodeCursor } from "@umbraco-cms/mcp-server-sdk";
import { UmbracoManagementClient } from "@umb-management-client";
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

  it("passes the decoded skip/take through to the Management API client", async () => {
    // Triggering a real webhook delivery log entry isn't practical in this test
    // environment, so this test mocks the API client to verify the fix directly:
    // that skip/take (decoded from the cursor) actually reach getWebhookByIdLogs,
    // rather than being discarded as they were before this fix.
    const fakeLog = {
      key: "11111111-1111-1111-1111-111111111111",
      webhookKey: "22222222-2222-2222-2222-222222222222",
      statusCode: "200",
      isSuccessStatusCode: true,
      date: "2026-01-01T00:00:00+00:00",
      eventAlias: CONTENT_PUBLISHED_EVENT,
      url: TEST_WEBHOOOK_URL,
      retryCount: 0,
      requestHeaders: "{}",
      requestBody: "{}",
      responseHeaders: "{}",
      responseBody: "{}",
      exceptionOccured: false,
    };
    const getWebhookByIdLogsSpy = jest.fn(async () => ({
      status: 200,
      data: { items: [fakeLog], total: 5 },
    }));
    const clientSpy = jest
      .spyOn(UmbracoManagementClient, "getClient")
      .mockReturnValue({ getWebhookByIdLogs: getWebhookByIdLogsSpy } as any);

    try {
      const id = "33333333-3333-3333-3333-333333333333";
      const result = await GetWebhookLogsTool.handler(
        { id, cursor: encodeCursor({ s: 0, t: 1 }) },
        createMockRequestHandlerExtra()
      );

      expect(getWebhookByIdLogsSpy).toHaveBeenCalledWith(
        id,
        { skip: 0, take: 1 },
        expect.anything()
      );

      const parsed = validateToolResponse(GetWebhookLogsTool, result) as CursorPaginatedResult;
      expect(parsed.total).toBe(5);
      expect(parsed.items).toHaveLength(1);
      // 5 total, 1 returned after skip 0 -> more pages remain
      expect(parsed.nextCursor).toBeDefined();
    } finally {
      clientSpy.mockRestore();
    }
  });
});
