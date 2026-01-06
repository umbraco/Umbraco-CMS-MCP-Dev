import GetTemplatesByIdArrayTool from "../get/get-template-by-id-array.js";
import { TemplateBuilder } from "./helpers/template-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra, validateToolResponse } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_TEMPLATE_NAME_1 = "_Test Template Array 1";
const TEST_TEMPLATE_NAME_2 = "_Test Template Array 2";

describe("get-template-by-id-array", () => {
  setupTestEnvironment();
  let builder1: TemplateBuilder;
  let builder2: TemplateBuilder;

  beforeEach(() => {
    builder1 = new TemplateBuilder();
    builder2 = new TemplateBuilder();
  });

  afterEach(async () => {
    await builder1.cleanup();
    await builder2.cleanup();
  });

  it("should get templates by id array", async () => {
    await builder1.withName(TEST_TEMPLATE_NAME_1).create();
    await builder2.withName(TEST_TEMPLATE_NAME_2).create();

    const result = await GetTemplatesByIdArrayTool.handler({
      id: [builder1.getId(), builder2.getId()]
    }, createMockRequestHandlerExtra());

    const data = validateToolResponse(GetTemplatesByIdArrayTool, result);
    expect(data).toBeDefined();
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle single template id", async () => {
    await builder1.withName(TEST_TEMPLATE_NAME_1).create();

    const result = await GetTemplatesByIdArrayTool.handler({
      id: [builder1.getId()]
    }, createMockRequestHandlerExtra());

    const data = validateToolResponse(GetTemplatesByIdArrayTool, result);
    expect(data).toBeDefined();
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle empty array", async () => {
    const result = await GetTemplatesByIdArrayTool.handler({
      id: []
    }, createMockRequestHandlerExtra());

    const data = validateToolResponse(GetTemplatesByIdArrayTool, result);
    expect(data).toBeDefined();
    expect(result).toMatchSnapshot();
  });

  it("should handle non-existent template ids", async () => {
    const result = await GetTemplatesByIdArrayTool.handler({
      id: [BLANK_UUID]
    }, createMockRequestHandlerExtra());

    const data = validateToolResponse(GetTemplatesByIdArrayTool, result);
    expect(data).toBeDefined();
    expect(result).toMatchSnapshot();
  });

  it("should handle no id parameter", async () => {
    const result = await GetTemplatesByIdArrayTool.handler({
      id: undefined
    }, createMockRequestHandlerExtra());

    const data = validateToolResponse(GetTemplatesByIdArrayTool, result);
    expect(data).toBeDefined();
    expect(result).toMatchSnapshot();
  });
});
