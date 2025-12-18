import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeDocumentBlueprintAncestorsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type SchemaParams = z.infer<typeof getTreeDocumentBlueprintAncestorsQueryParams>;

const GetDocumentBlueprintAncestorsTool = {
  name: "get-document-blueprint-ancestors",
  description: "Gets the ancestors of a document blueprint by Id",
  schema: getTreeDocumentBlueprintAncestorsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: SchemaParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeDocumentBlueprintAncestors(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeDocumentBlueprintAncestorsQueryParams.shape>;

export default withStandardDecorators(GetDocumentBlueprintAncestorsTool);
