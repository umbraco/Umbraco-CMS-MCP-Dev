import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { UpdateMediaTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putMediaTypeByIdParams,
  putMediaTypeByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const UpdateMediaTypeTool = CreateUmbracoTool(
  "update-media-type",
  "Updates a media type by Id",
  {
    id: putMediaTypeByIdParams.shape.id,
    data: z.object(putMediaTypeByIdBody.shape),
  },
  async (model: { id: string; data: UpdateMediaTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putMediaTypeById(model.id, model.data);

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

export default UpdateMediaTypeTool;
