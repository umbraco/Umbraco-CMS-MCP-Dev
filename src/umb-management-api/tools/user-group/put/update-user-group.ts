import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { UpdateUserGroupRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putUserGroupByIdBody,
  putUserGroupByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const UpdateUserGroupTool = CreateUmbracoTool(
  "update-user-group",
  "Updates a user group by Id",
  {
    id: putUserGroupByIdParams.shape.id,
    data: z.object(putUserGroupByIdBody.shape),
  },
  async (model: { id: string; data: UpdateUserGroupRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.putUserGroupById(model.id, model.data);

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

export default UpdateUserGroupTool;
