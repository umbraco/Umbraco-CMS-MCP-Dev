import { UmbracoManagementClient } from "@umb-management-client";
import { getMediaByIdReferencedByParams, getMediaByIdReferencedByQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const schema = z.object({
  ...getMediaByIdReferencedByParams.shape,
  ...getMediaByIdReferencedByQueryParams.shape,
}).shape;

const GetMediaByIdReferencedByTool = {
  name: "get-media-by-id-referenced-by",
  description: `Get items that reference a specific media item
  Use this to find all content, documents, or other items that are currently referencing a specific media item.`,
  schema,
  isReadOnly: true,
  slices: ['references'],
  handler: async ({ id, skip, take }: { id: string; skip?: number; take?: number }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaByIdReferencedBy(id, { skip, take });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof schema>;

export default withStandardDecorators(GetMediaByIdReferencedByTool);