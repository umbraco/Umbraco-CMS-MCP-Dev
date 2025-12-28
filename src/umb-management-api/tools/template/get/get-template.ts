import { UmbracoManagementClient } from "@umb-management-client";
import { getTemplateByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetTemplateTool = {
  name: "get-template",
  description: "Gets a template by Id",
  schema: getTemplateByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTemplateById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTemplateByIdParams.shape>;

export default withStandardDecorators(GetTemplateTool);
