import GetWebhookEventsTool from "../get/get-webhook-events.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("get-webhook-events", () => {
  setupTestEnvironment();

  it("should get list of webhook events", async () => {
    const result = await GetWebhookEventsTool.handler({}, createMockRequestHandlerExtra());
    expect(result).toMatchSnapshot();
  });
});
