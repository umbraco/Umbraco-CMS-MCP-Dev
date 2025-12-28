import { getItemTemplateQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import GetTemplatesByIdArrayTool from "../get/get-template-by-id-array.js";
import { TemplateBuilder } from "./helpers/template-builder.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { jest } from "@jest/globals";
import { BLANK_UUID } from "@/constants/constants.js";

const TEST_TEMPLATE_NAME_1 = "_Test Template Array 1";
const TEST_TEMPLATE_NAME_2 = "_Test Template Array 2";

describe("get-template-by-id-array", () => {
  let originalConsoleError: typeof console.error;
  let builder1: TemplateBuilder;
  let builder2: TemplateBuilder;

  beforeEach(() => {
    originalConsoleError = console.error;
    console.error = jest.fn();
    builder1 = new TemplateBuilder();
    builder2 = new TemplateBuilder();
  });

  afterEach(async () => {
    console.error = originalConsoleError;
    await builder1.cleanup();
    await builder2.cleanup();
  });

  it("should get templates by id array", async () => {
    await builder1.withName(TEST_TEMPLATE_NAME_1).create();
    await builder2.withName(TEST_TEMPLATE_NAME_2).create();
    
    const params = getItemTemplateQueryParams.parse({ 
      id: [builder1.getId(), builder2.getId()] 
    });
    
    const result = await GetTemplatesByIdArrayTool.handler(params, {
      signal: new AbortController().signal,
    });
    
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle single template id", async () => {
    await builder1.withName(TEST_TEMPLATE_NAME_1).create();
    
    const params = getItemTemplateQueryParams.parse({ 
      id: [builder1.getId()] 
    });
    
    const result = await GetTemplatesByIdArrayTool.handler(params, {
      signal: new AbortController().signal,
    });
    
    const normalizedItems = createSnapshotResult(result);
    expect(normalizedItems).toMatchSnapshot();
  });

  it("should handle empty array", async () => {
    const params = getItemTemplateQueryParams.parse({ id: [] });
    
    const result = await GetTemplatesByIdArrayTool.handler(params, {
      signal: new AbortController().signal,
    });
    
    expect(result).toMatchSnapshot();
  });

  it("should handle non-existent template ids", async () => {
    const params = getItemTemplateQueryParams.parse({ 
      id: [BLANK_UUID] 
    });
    
    const result = await GetTemplatesByIdArrayTool.handler(params, {
      signal: new AbortController().signal,
    });
    
    expect(result).toMatchSnapshot();
  });

  it("should handle no id parameter", async () => {
    const params = getItemTemplateQueryParams.parse({});
    
    const result = await GetTemplatesByIdArrayTool.handler(params, {
      signal: new AbortController().signal,
    });
    
    expect(result).toMatchSnapshot();
  });
});