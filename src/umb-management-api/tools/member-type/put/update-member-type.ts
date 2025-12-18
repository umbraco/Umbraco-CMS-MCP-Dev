import { UmbracoManagementClient } from "@umb-management-client";
import { UpdateMemberTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  putMemberTypeByIdBody,
  putMemberTypeByIdParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const UpdateMemberTypeTool = {
  name: "update-member-type",
  description: "Updates a member type by id",
  schema: {
    id: putMemberTypeByIdParams.shape.id,
    data: z.object(putMemberTypeByIdBody.shape),
  },
  isReadOnly: false,
  slices: ['update'],
  handler: async (model: { id: string; data: UpdateMemberTypeRequestModel }) => {
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
  },
} satisfies ToolDefinition<{
  id: typeof putMemberTypeByIdParams.shape.id;
  data: ReturnType<typeof z.object<typeof putMemberTypeByIdBody.shape>>;
}>;

export default withStandardDecorators(UpdateMemberTypeTool);
