import {
  getItemLanguageQueryParams,
  getItemLanguageResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { GetItemLanguageParams } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemLanguageResponse,
});

const GetLanguageItemsTool = {
  name: "get-language-items",
  description: "Gets language items (optionally filtered by isoCode)",
  inputSchema: getItemLanguageQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetItemLanguageParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemLanguage(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemLanguageQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetLanguageItemsTool);
