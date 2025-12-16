import { UmbracoManagementClient } from "@umb-management-client";
import { CreateTemplateRequestModel } from "@/umb-management-api/schemas/index.js";
import { postTemplateBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const CreateTemplateTool = {
  name: "create-template",
  description: "Creates a new template",
  schema: postTemplateBody.shape,
  isReadOnly: false,
  slices: ['create'],
  handler: async (model: CreateTemplateRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.postTemplate(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postTemplateBody.shape>;

export default withStandardDecorators(CreateTemplateTool);
