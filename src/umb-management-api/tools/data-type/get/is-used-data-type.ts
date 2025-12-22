import { getDataTypeByIdIsUsedParams, getDataTypeByIdIsUsedResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetOperation, FULL_RESPONSE_OPTIONS } from "@/helpers/mcp/tool-decorators.js";

const IsUsedDataTypeTool = {
  name: "is-used-data-type",
  description: "Checks if a data type is used within Umbraco",
  inputSchema: getDataTypeByIdIsUsedParams.shape,
  outputSchema: getDataTypeByIdIsUsedResponse,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['references'],
  handler: (async ({ id }: { id: string }) => {  
    return executeGetOperation((client) =>
      client.getDataTypeByIdIsUsed(id, FULL_RESPONSE_OPTIONS)
    );
  }),
} satisfies ToolDefinition<typeof getDataTypeByIdIsUsedParams.shape, typeof getDataTypeByIdIsUsedResponse>;

export default withStandardDecorators(IsUsedDataTypeTool);
