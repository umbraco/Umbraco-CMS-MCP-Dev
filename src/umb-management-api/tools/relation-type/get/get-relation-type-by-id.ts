import { UmbracoManagementClient } from "@umb-management-client";
import { getRelationTypeByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetRelationTypeByIdTool = {
  name: "get-relation-type-by-id",
  description: "Gets a relation type by Id",
  schema: getRelationTypeByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRelationTypeById(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getRelationTypeByIdParams.shape>;

export default withStandardDecorators(GetRelationTypeByIdTool);