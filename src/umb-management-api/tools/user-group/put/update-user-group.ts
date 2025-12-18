import { UmbracoManagementClient } from "@umb-management-client";
import { UpdateUserGroupRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putUserGroupByIdBody,
  putUserGroupByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const updateUserGroupSchema = z.object({
  id: putUserGroupByIdParams.shape.id,
  data: z.object(putUserGroupByIdBody.shape),
});

const UpdateUserGroupTool = {
  name: "update-user-group",
  description: "Updates a user group by Id",
  schema: updateUserGroupSchema.shape,
  isReadOnly: false,
  slices: ['update'],
  handler: async (model: { id: string; data: UpdateUserGroupRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putUserGroupById(model.id, model.data);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof updateUserGroupSchema.shape>;

export default withStandardDecorators(UpdateUserGroupTool);
