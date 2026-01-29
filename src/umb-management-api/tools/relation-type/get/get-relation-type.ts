import { GetRelationTypeParams } from "@/umb-management-api/schemas/index.js";
import { getRelationTypeQueryParams, getRelationTypeResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetRelationTypeTool = {
  name: "get-relation-type",
  description: "Gets all relation types with pagination",
  inputSchema: getRelationTypeQueryParams.shape,
  outputSchema: getRelationTypeResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['list'],
  handler: (async (model: GetRelationTypeParams) => {
    return executeGetApiCall((client) =>
      client.getRelationType(model, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getRelationTypeQueryParams.shape, typeof getRelationTypeResponse.shape>;

export default withStandardDecorators(GetRelationTypeTool);