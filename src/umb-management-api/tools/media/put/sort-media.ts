import { UmbracoManagementClient } from "@umb-management-client";
import { putMediaSortBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type SortMediaParams = z.infer<typeof putMediaSortBody>;

const SortMediaTool = {
  name: "sort-media",
  description: "Sorts the order of media items under a parent.",
  schema: putMediaSortBody.shape,
  isReadOnly: false,
  slices: ['sort'],
  handler: async (model: SortMediaParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putMediaSort(model);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof putMediaSortBody.shape>;

export default withStandardDecorators(SortMediaTool);
