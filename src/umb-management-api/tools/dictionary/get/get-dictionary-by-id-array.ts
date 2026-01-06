import { getItemDictionaryQueryParams, getItemDictionaryResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

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
    return executeGetItemsApiCall((client) =>
      client.getItemDictionary(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemDictionaryQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDictionaryByIdArrayTool);
