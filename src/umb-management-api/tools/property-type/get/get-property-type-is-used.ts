import { UmbracoManagementClient } from "@umb-management-client";
import { getPropertyTypeIsUsedQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type SchemaParams = z.infer<typeof getPropertyTypeIsUsedQueryParams>;

const GetPropertyTypeIsUsedTool = {
  name: "get-property-type-is-used",
  description: "Checks if a property type is used within Umbraco",
  schema: getPropertyTypeIsUsedQueryParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ contentTypeId, propertyAlias }: SchemaParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getPropertyTypeIsUsed({
      contentTypeId,
      propertyAlias,
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
} satisfies ToolDefinition<typeof getPropertyTypeIsUsedQueryParams.shape>;

export default withStandardDecorators(GetPropertyTypeIsUsedTool);
