import { GetItemPartialViewParams } from "@/umbraco-api/schemas/index.js";
import { getItemPartialViewQueryParams, getItemPartialViewResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemPartialViewResponse,
});

const GetPartialViewSearchTool = {
  name: "get-partial-view-search",
  description: "Searches for partial views by name or path",
  inputSchema: getItemPartialViewQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['search'],
  handler: (async (model: GetItemPartialViewParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemPartialView(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemPartialViewQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetPartialViewSearchTool);