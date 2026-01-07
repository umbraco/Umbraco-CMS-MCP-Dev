import { getItemLanguageDefaultResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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
