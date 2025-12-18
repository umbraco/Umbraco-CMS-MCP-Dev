import { UmbracoManagementClient } from "@umb-management-client";
import { getTreeStylesheetSiblingsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetStylesheetSiblingsTool = {
  name: "get-stylesheet-siblings",
  description: "Gets sibling stylesheets for a given descendant path",
  schema: getTreeStylesheetSiblingsQueryParams.shape,
  isReadOnly: true,
  slices: ['tree'],
  handler: async (params) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTreeStylesheetSiblings(params);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof getTreeStylesheetSiblingsQueryParams.shape>;

export default withStandardDecorators(GetStylesheetSiblingsTool);
