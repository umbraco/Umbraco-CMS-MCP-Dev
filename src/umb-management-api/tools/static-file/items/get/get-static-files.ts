import { getItemStaticFileQueryParams, getItemStaticFileResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { GetItemStaticFileParams } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";

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
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemStaticFile(params);
    return createToolResult({ items: response });
  }),
} satisfies ToolDefinition<typeof getItemStaticFileQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetStaticFilesTool);
