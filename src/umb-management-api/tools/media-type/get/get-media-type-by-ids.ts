import { UmbracoManagementClient } from "@umb-management-client";
import { getMediaTypeByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";

const inputSchema = z.object({
  ids: z.array(z.string()),
});

// Array responses must be wrapped in an object
const outputSchema = z.object({
  items: z.array(getMediaTypeByIdResponse),
});

const GetMediaTypeByIdsTool = {
  name: "get-media-type-by-ids",
  description: "Gets media types by ids",
  inputSchema: inputSchema.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async ({ ids }: { ids: string[] }) => {
    const client = UmbracoManagementClient.getClient();
    const responses = await Promise.all(
      ids.map((id: string) => client.getMediaTypeById(id))
    );
    return createToolResult({ items: responses });
  }),
} satisfies ToolDefinition<typeof inputSchema.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetMediaTypeByIdsTool);
