import { GetTreeDocumentBlueprintAncestorsParams } from "@/umb-management-api/schemas/index.js";
import { getTreeDocumentBlueprintAncestorsQueryParams, getTreeDocumentBlueprintAncestorsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { executeGetItemsApiCall } from "@/helpers/mcp/index.js";

const outputSchema = z.object({
  items: getTreeDocumentBlueprintAncestorsResponse,
});

const GetDocumentBlueprintAncestorsTool = {
  name: "get-document-blueprint-ancestors",
  description: "Gets the ancestors of a document blueprint by Id",
  inputSchema: getTreeDocumentBlueprintAncestorsQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['tree'],
  handler: (async (params: GetTreeDocumentBlueprintAncestorsParams) => {
    return executeGetItemsApiCall((client) =>
      client.getTreeDocumentBlueprintAncestors(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getTreeDocumentBlueprintAncestorsQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentBlueprintAncestorsTool);
