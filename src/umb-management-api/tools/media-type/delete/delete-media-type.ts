import { UmbracoManagementClient } from "@umb-management-client";
import { deleteMediaTypeByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteMediaTypeTool = {
  name: "delete-media-type",
  description: "Deletes a media type by Id",
  schema: deleteMediaTypeByIdParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.deleteMediaTypeById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteMediaTypeByIdParams.shape>;

export default withStandardDecorators(DeleteMediaTypeTool);
