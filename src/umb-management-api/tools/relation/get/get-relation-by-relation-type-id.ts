import { getRelationByRelationTypeIdParams, getRelationByRelationTypeIdQueryParams, getRelationByRelationTypeIdResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const schemaParams = z.object({
  ...getRelationByRelationTypeIdParams.shape,
  ...getRelationByRelationTypeIdQueryParams.shape,
});

const GetRelationByRelationTypeIdTool = {
  name: "get-relation-by-relation-type-id",
  description: "Gets relations by relation type ID",
  inputSchema: schemaParams.shape,
  outputSchema: getRelationByRelationTypeIdResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async ({ id, skip, take }: z.infer<typeof schemaParams>) => {
    return executeGetApiCall((client) =>
      client.getRelationByRelationTypeId(id, { skip, take }, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof schemaParams.shape, typeof getRelationByRelationTypeIdResponse.shape>;

export default withStandardDecorators(GetRelationByRelationTypeIdTool);