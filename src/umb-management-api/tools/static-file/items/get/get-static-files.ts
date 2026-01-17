import { getItemStaticFileQueryParams, getItemStaticFileResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemStaticFileParams } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Wrap array response in object for MCP compliance
const outputSchema = z.object({
  items: getItemStaticFileResponse,
});

const GetStaticFilesTool = {
  name: "get-static-files",
  description: "Lists static files with optional path filtering for browsing the file system",
  inputSchema: getItemStaticFileQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async (params: GetItemStaticFileParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemStaticFile(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemStaticFileQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetStaticFilesTool);
