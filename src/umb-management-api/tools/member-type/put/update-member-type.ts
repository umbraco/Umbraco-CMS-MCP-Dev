import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { UpdateMemberTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putMemberTypeByIdBody,
  putMemberTypeByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const UpdateMemberTypeTool = CreateUmbracoWriteTool(
  "update-member-type",
  "Updates a member type by id",
  {
    id: putMemberTypeByIdParams.shape.id,
    data: z.object(putMemberTypeByIdBody.shape),
  },
  async (model: { id: string; data: UpdateMemberTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putMemberTypeById(model.id, model.data);

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

export default UpdateMemberTypeTool;
