import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const getMediaTypeByIdsSchema = z.object({
  ids: z.array(z.string()),
});

const GetMediaTypeByIdsTool = {
  name: "get-media-type-by-ids",
  description: "Gets media types by ids",
  schema: getMediaTypeByIdsSchema.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async ({ ids }: { ids: string[] }) => {
    const client = UmbracoManagementClient.getClient();
    const responses = await Promise.all(
      ids.map((id: string) => client.getMediaTypeById(id))
    );

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(responses),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getMediaTypeByIdsSchema.shape>;

export default withStandardDecorators(GetMediaTypeByIdsTool);
