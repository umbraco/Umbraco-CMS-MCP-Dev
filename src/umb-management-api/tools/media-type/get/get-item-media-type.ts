import { getItemMediaTypeQueryParams, getItemMediaTypeResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemMediaTypeParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

// Array responses must be wrapped in an object
const outputSchema = z.object({
  items: getItemMediaTypeResponse,
});

const GetItemMediaTypeTool = {
  name: "get-item-media-type",
  description: "Gets media type items by their ids",
  inputSchema: getItemMediaTypeQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async (params: GetItemMediaTypeParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemMediaType(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemMediaTypeQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetItemMediaTypeTool);
