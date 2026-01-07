import {
  getItemLanguageQueryParams,
  getItemLanguageResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { GetItemLanguageParams } from "@/umb-management-api/schemas/index.js";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

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
