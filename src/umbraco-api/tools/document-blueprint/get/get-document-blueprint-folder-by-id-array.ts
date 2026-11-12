import { GetItemDocumentBlueprintFolderParams } from "@/umbraco-api/schemas/index.js";
import { getItemDocumentBlueprintFolderQueryParams, getItemDocumentBlueprintFolderResponse } from "@/umbraco-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetItemsApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const outputSchema = z.object({
  items: getItemDocumentBlueprintFolderResponse,
});

const GetDocumentBlueprintFolderByIdArrayTool = {
  name: "get-document-blueprint-folder-by-id-array",
  description: `Gets lightweight items (id, name, flags) for multiple document blueprint folders by Id.
  Use to resolve folder names for a set of folder Ids; use get-document-blueprint-folder for a single folder's full details.`,
  inputSchema: getItemDocumentBlueprintFolderQueryParams.shape,
  outputSchema: outputSchema.shape,
  annotations: { readOnlyHint: true },
  slices: ['list', 'folders'],
  handler: (async (params: GetItemDocumentBlueprintFolderParams) => {
    return executeGetItemsApiCall((client) =>
      client.getItemDocumentBlueprintFolder(params, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getItemDocumentBlueprintFolderQueryParams.shape, typeof outputSchema.shape>;

export default withStandardDecorators(GetDocumentBlueprintFolderByIdArrayTool);
