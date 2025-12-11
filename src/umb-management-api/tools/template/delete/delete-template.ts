import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { deleteTemplateByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const DeleteTemplateTool = CreateUmbracoWriteTool(
  "delete-template",
  "Deletes a template by Id",
  deleteTemplateByIdParams.shape,
  async ({ id }) => {
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
  }
);

export default DeleteTemplateTool;
