import { GetItemPartialViewParams } from "@/umb-management-api/schemas/index.js";
import { getItemPartialViewQueryParams, getItemPartialViewResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { ToolDefinition } from "types/tool-definition.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

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