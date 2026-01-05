import { UmbracoManagementClient } from "@umb-management-client";
import { getPropertyTypeIsUsedQueryParams, getPropertyTypeIsUsedResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type SchemaParams = z.infer<typeof getPropertyTypeIsUsedQueryParams>;

const outputSchema = z.object({
  isUsed: getPropertyTypeIsUsedResponse,
});

const GetPropertyTypeIsUsedTool = {
  name: "get-property-type-is-used",
  description: "Checks if a property type is used within Umbraco",
  inputSchema: getPropertyTypeIsUsedQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ contentTypeId, propertyAlias }: SchemaParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getPropertyTypeIsUsed({
      contentTypeId,
      propertyAlias,
    });

    return createToolResult({ isUsed: response });
  }),
} satisfies ToolDefinition<typeof getPropertyTypeIsUsedQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetPropertyTypeIsUsedTool);
