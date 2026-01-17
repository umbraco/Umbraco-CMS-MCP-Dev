import { GetDictionaryParams } from "@/umb-management-api/schemas/index.js";
import { getDictionaryQueryParams, getDictionaryResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const FindDictionaryItemTool = {
  name: "find-dictionary",
  description: "Finds a dictionary by Id or name",
  inputSchema: getDictionaryQueryParams.shape,
  outputSchema: getDictionaryResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['search'],
  handler: (async (model: GetDictionaryParams) => {
    return executeGetApiCall((client) =>
      client.getDictionary(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDictionaryQueryParams.shape, typeof getDictionaryResponse.shape>;

export default withStandardDecorators(FindDictionaryItemTool);
