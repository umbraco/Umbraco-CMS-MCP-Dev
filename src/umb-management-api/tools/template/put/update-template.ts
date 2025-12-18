import { UmbracoManagementClient } from "@umb-management-client";
import { putTemplateByIdBody, putTemplateByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const updateTemplateSchema = {
  id: putTemplateByIdParams.shape.id,
  data: z.object(putTemplateByIdBody.shape),
};

const UpdateTemplateTool = {
  name: "update-template",
  description: "Updates a template by Id",
  schema: updateTemplateSchema,
  isReadOnly: false,
  slices: ['update'],
  handler: async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.putTemplateById(model.id, model.data);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof updateTemplateSchema>;

export default withStandardDecorators(UpdateTemplateTool);
