import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeDocumentBlueprintSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type SchemaParams = z.infer<typeof getTreeDocumentBlueprintSiblingsQueryParams>;

const GetDocumentBlueprintSiblingsTool = {
  name: "get-document-blueprint-siblings",
  description: "Gets sibling document blueprints for a given descendant id",
  schema: getTreeDocumentBlueprintSiblingsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params: SchemaParams) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTreeDocumentBlueprintSiblings(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getTreeDocumentBlueprintSiblingsQueryParams.shape>;

export default withStandardDecorators(GetDocumentBlueprintSiblingsTool);
