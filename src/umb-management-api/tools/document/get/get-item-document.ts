import { UmbracoManagementClient } from "@umb-management-client";
import { getItemDocumentQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const GetItemDocumentTool = {
  name: "get-item-document",
  description: "Gets document items by their ids",
  schema: getItemDocumentQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (params: z.infer<typeof getItemDocumentQueryParams>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getItemDocument(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getItemDocumentQueryParams.shape>;

export default withStandardDecorators(GetItemDocumentTool);
