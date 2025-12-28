import { UmbracoManagementClient } from "@umb-management-client";
import { GetRelationTypeParams } from "@/umb-management-api/schemas/index.js";
import { getRelationTypeQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetRelationTypeTool = {
  name: "get-relation-type",
  description: "Gets all relation types with pagination",
  schema: getRelationTypeQueryParams.shape,
  isReadOnly: true,
  slices: ['list'],
  handler: async (model: GetRelationTypeParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRelationType(model);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getRelationTypeQueryParams.shape>;

export default withStandardDecorators(GetRelationTypeTool);