import GetWebhookEventsTool from "../get/get-webhook-events.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-webhook-events", () => {
  setupTestEnvironment();

  it("should get list of webhook events", async () => {
    const result = await GetWebhookEventsTool.handler({}, createMockRequestHandlerExtra());
    expect(result).toMatchSnapshot();
  });
});
