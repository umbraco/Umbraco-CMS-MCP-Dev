import { UmbracoManagementClient } from "@umb-management-client";
import { deleteTemplateByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const DeleteTemplateTool = {
  name: "delete-template",
  description: "Deletes a template by Id",
  schema: deleteTemplateByIdParams.shape,
  isReadOnly: false,
  slices: ['delete'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.deleteTemplateById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof deleteTemplateByIdParams.shape>;

export default withStandardDecorators(DeleteTemplateTool);
