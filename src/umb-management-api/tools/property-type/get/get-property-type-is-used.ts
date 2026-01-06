import { ToolDefinition } from "types/tool-definition.js";
import { getPropertyTypeIsUsedQueryParams, getPropertyTypeIsUsedResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

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
    return executeGetItemsApiCall((client) =>
      client.getPropertyTypeIsUsed({
        contentTypeId,
        propertyAlias,
      }, CAPTURE_RAW_HTTP_RESPONSE)
    );

  }),
} satisfies ToolDefinition<typeof getPropertyTypeIsUsedQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetPropertyTypeIsUsedTool);
