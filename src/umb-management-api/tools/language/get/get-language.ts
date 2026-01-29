import {
  getLanguageQueryParams,
  getLanguageResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetLanguageParams } from "@/umb-management-api/schemas/index.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetLanguageTool = {
  name: "get-language",
  description: "Gets all languages with optional pagination",
  inputSchema: getLanguageQueryParams.shape,
  outputSchema: getLanguageResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['list'],
  handler: (async (params: GetLanguageParams) => {
    return executeGetApiCall((client) =>
      client.getLanguage(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getLanguageQueryParams.shape, typeof getLanguageResponse.shape>;

export default withStandardDecorators(GetLanguageTool);
