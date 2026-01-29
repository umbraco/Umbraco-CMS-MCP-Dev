import GetMediaAuditLogTool from "../get/get-media-audit-log.js";
import { MediaBuilder } from "./helpers/media-builder.js";
import { MediaTestHelper } from "./helpers/media-test-helper.js";
import { TemporaryFileBuilder } from "../../temporary-file/__tests__/helpers/temporary-file-builder.js";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_MEDIA_NAME = "_Test AuditLogMedia";

describe("get-media-audit-log", () => {
  setupTestEnvironment();
  let mediaId: string;
  let tempFileBuilder: TemporaryFileBuilder;

  beforeEach(async () => {
    tempFileBuilder = await new TemporaryFileBuilder()
      .withExampleFile()
      .create();

    // Create a media item
    const builder = await new MediaBuilder()
      .withName(TEST_MEDIA_NAME)
      .withImageMediaType()
      .withImageValue(tempFileBuilder.getId())
      .create();
    mediaId = builder.getId();
  });

  afterEach(async () => {
    await MediaTestHelper.cleanup(TEST_MEDIA_NAME);
  });

  it("should return audit logs for a valid media item", async () => {
    const result = await GetMediaAuditLogTool.handler(
      {
        id: mediaId,
        data: {
          orderDirection: "Ascending",
          sinceDate: new Date().toISOString(),
          skip: 0,
          take: 100,
        },
      } as any,
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's outputSchema
    const content = validateToolResponse(GetMediaAuditLogTool, result);
    expect(content).toBeDefined();
  });

  it("should handle non-existent media", async () => {
    const result = await GetMediaAuditLogTool.handler(
      {
        id: BLANK_UUID,
        data: {
          orderDirection: "Ascending",
          sinceDate: new Date().toISOString(),
          skip: 0,
          take: 100,
        },
      } as any,
      createMockRequestHandlerExtra()
    );

    // Validate response against tool's outputSchema
    const content = validateToolResponse(GetMediaAuditLogTool, result);
    expect(content).toBeDefined();
    expect(result).toMatchSnapshot();
  });
});
