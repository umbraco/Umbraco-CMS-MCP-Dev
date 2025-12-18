import { UmbracoManagementClient } from "@umb-management-client";
import { UpdateMemberRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putMemberByIdBody,
  putMemberByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const updateMemberSchema = {
  id: putMemberByIdParams.shape.id,
  data: z.object(putMemberByIdBody.shape),
};

const UpdateMemberTool = {
  name: "update-member",
  description: "Updates a member by Id",
  schema: updateMemberSchema,
  isReadOnly: false,
  slices: ['update'],
  handler: async (model: { id: string; data: UpdateMemberRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putMemberById(model.id, model.data);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof updateMemberSchema>;

export default withStandardDecorators(UpdateMemberTool);
