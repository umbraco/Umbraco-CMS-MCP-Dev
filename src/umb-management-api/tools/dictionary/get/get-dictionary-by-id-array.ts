import { getItemDictionaryQueryParams, getItemDictionaryResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

const outputSchema = z.object({
  items: getItemDictionaryResponse,
});

const GetDictionaryByIdArrayTool = {
  name: "get-dictionary-by-id-array",
  description: "Gets dictionary items by IDs (or empty array if no IDs are provided)",
  inputSchema: getItemDictionaryQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (params: { id?: string[] }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemDictionary(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getItemDictionaryQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDictionaryByIdArrayTool);
