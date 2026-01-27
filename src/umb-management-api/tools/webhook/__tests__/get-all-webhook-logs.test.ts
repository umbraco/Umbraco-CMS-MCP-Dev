import GetAllWebhookLogsTool from "../get/get-all-webhook-logs.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("get-all-webhook-logs", () => {
  setupTestEnvironment();

  it("should get logs for all webhooks", async () => {
    const result = await GetAllWebhookLogsTool.handler({
      skip: 0,
      take: 100
    }, createMockRequestHandlerExtra());
    expect(result).toMatchSnapshot();
  });

  it("should handle pagination parameters", async () => {
    const result = await GetAllWebhookLogsTool.handler({
      skip: 0,
      take: 10
    }, createMockRequestHandlerExtra());
    expect(result).toMatchSnapshot();
  });
});
