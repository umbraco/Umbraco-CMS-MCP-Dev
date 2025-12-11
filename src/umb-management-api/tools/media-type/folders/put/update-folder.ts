import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import {
  putMediaTypeFolderByIdParams,
  putMediaTypeFolderByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const UpdateMediaTypeFolderTool = CreateUmbracoWriteTool(
  "update-media-type-folder",
  "Updates a media type folder by Id",
  {
    id: putMediaTypeFolderByIdParams.shape.id,
    data: z.object(putMediaTypeFolderByIdBody.shape),
  },
  async (model: { id: string; data: { name: string } }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putMediaTypeFolderById(model.id, model.data);

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

export default UpdateMediaTypeFolderTool;
