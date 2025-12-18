import { UmbracoManagementClient } from "@umb-management-client";
import { putDocumentSortBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const SortDocumentTool = {
  name: "sort-document",
  description: "Sorts the order of documents under a parent.",
  schema: putDocumentSortBody.shape,
  isReadOnly: false,
  slices: ['sort'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Sort),
  handler: async (model: any) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentSort(model);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof putDocumentSortBody.shape>;

export default withStandardDecorators(SortDocumentTool);
