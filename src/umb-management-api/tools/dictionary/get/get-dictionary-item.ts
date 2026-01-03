import { getDictionaryByIdParams, getDictionaryByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetDictionaryItemTool = {
  name: "get-dictionary",
  description: "Gets a dictionary by Id",
  inputSchema: getDictionaryByIdParams.shape,
  outputSchema: getDictionaryByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDictionaryById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDictionaryByIdParams.shape, typeof getDictionaryByIdResponse.shape>;

export default withStandardDecorators(GetDictionaryItemTool);
