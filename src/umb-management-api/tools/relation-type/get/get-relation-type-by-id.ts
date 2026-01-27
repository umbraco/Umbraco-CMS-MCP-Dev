import { getRelationTypeByIdParams, getRelationTypeByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRelationTypeByIdTool = {
  name: "get-relation-type-by-id",
  description: "Gets a relation type by Id",
  inputSchema: getRelationTypeByIdParams.shape,
  outputSchema: getRelationTypeByIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getRelationTypeById(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRelationTypeByIdParams.shape, typeof getRelationTypeByIdResponse.shape>;

export default withStandardDecorators(GetRelationTypeByIdTool);