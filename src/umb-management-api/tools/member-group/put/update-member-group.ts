import { UmbracoManagementClient } from "@umb-management-client";
import { UpdateMemberGroupRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putMemberGroupByIdBody,
  putMemberGroupByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const updateMemberGroupSchema = {
  id: putMemberGroupByIdParams.shape.id,
  data: z.object(putMemberGroupByIdBody.shape),
};

const UpdateMemberGroupTool = {
  name: "update-member-group",
  description: "Updates a member group by Id",
  schema: updateMemberGroupSchema,
  isReadOnly: false,
  slices: ['update'],
  handler: async (model: { id: string; data: UpdateMemberGroupRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.putMemberGroupById(model.id, model.data);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof updateMemberGroupSchema>;

export default withStandardDecorators(UpdateMemberGroupTool);
