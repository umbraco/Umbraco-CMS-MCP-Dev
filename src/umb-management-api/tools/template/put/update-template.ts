import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { putTemplateByIdBody, putTemplateByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const UpdateTemplateTool = CreateUmbracoWriteTool(
  "update-template",
  "Updates a template by Id",
  {
    id: putTemplateByIdParams.shape.id,
    data: z.object(putTemplateByIdBody.shape),
  },
  async (model: { id: string; data: any }) => {
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
  }
);

export default UpdateTemplateTool;
