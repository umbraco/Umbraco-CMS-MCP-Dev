import { GetRelationTypeParams } from "@/umb-management-api/schemas/index.js";
import { getRelationTypeQueryParams, getRelationTypeResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

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