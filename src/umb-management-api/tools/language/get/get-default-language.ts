import { getItemLanguageDefaultResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDefaultLanguageTool = {
  name: "get-default-language",
  description: "Gets the default language",
  inputSchema: {},
  outputSchema: getItemLanguageDefaultResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['read'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getItemLanguageDefault(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getItemLanguageDefaultResponse.shape>;

export default withStandardDecorators(GetDefaultLanguageTool);
