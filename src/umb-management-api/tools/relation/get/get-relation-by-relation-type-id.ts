import { UmbracoManagementClient } from "@umb-management-client";
import { getRelationByRelationTypeIdParams, getRelationByRelationTypeIdQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const schemaParams = z.object({
  ...getRelationByRelationTypeIdParams.shape,
  ...getRelationByRelationTypeIdQueryParams.shape,
});

const GetRelationByRelationTypeIdTool = {
  name: "get-relation-by-relation-type-id",
  description: "Gets relations by relation type ID",
  schema: schemaParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id, skip, take }: z.infer<typeof schemaParams>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getRelationByRelationTypeId(id, {
      skip,
      take
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof schemaParams.shape>;

export default withStandardDecorators(GetRelationByRelationTypeIdTool);