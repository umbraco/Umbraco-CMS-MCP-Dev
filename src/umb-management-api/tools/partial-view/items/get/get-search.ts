import { UmbracoManagementClient } from "@umb-management-client";
import { GetItemPartialViewParams } from "@/umb-management-api/schemas/index.js";
import { getItemPartialViewQueryParams, getItemPartialViewResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemPartialView(model);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getItemPartialViewQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetPartialViewSearchTool);