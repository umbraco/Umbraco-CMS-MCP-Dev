import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import {
  putMediaByIdValidateParams,
  putMediaByIdValidateBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const ValidateMediaUpdateTool = CreateUmbracoTool(
  "validate-media-update",
  "Validates media data before updating an existing media item by Id",
  {
    id: putMediaByIdValidateParams.shape.id,
    data: z.object(putMediaByIdValidateBody.shape),
  },
  async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putMediaByIdValidate(model.id, model.data);
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

export default ValidateMediaUpdateTool;
