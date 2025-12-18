import { UmbracoManagementClient } from "@umb-management-client";
import { putUserDataBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { UpdateUserDataRequestModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const UpdateUserDataTool = {
  name: "update-user-data",
  description: "Updates an existing user data record",
  schema: putUserDataBody.shape,
  isReadOnly: false,
  slices: ['update'],
  handler: async (body: UpdateUserDataRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putUserData(body);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof putUserDataBody.shape>;

export default withStandardDecorators(UpdateUserDataTool);