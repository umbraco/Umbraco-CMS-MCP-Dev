import { UmbracoManagementClient } from "@umb-management-client";
import { getMediaAreReferencedQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type SchemaParams = z.infer<typeof getMediaAreReferencedQueryParams>;

const GetMediaAreReferencedTool = {
  name: "get-media-are-referenced",
  description: `Check if media items are referenced
  Use this to verify if specific media items are being referenced by other content before deletion or modification.`,
  schema: getMediaAreReferencedQueryParams.shape,
  isReadOnly: true,
  slices: ['references'],
  handler: async ({ id, skip, take }: SchemaParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaAreReferenced({ id, skip, take });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getMediaAreReferencedQueryParams.shape>;

export default withStandardDecorators(GetMediaAreReferencedTool);