import { getRelationTypeByIdParams, getRelationTypeByIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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