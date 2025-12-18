import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentByIdPublishedParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const GetDocumentPublishTool = {
  name: "get-document-publish",
  description: "Gets the published state of a document by Id.",
  schema: getDocumentByIdPublishedParams.shape,
  isReadOnly: true,
  slices: ['publish'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Read),
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentByIdPublished(id);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDocumentByIdPublishedParams.shape>;

export default withStandardDecorators(GetDocumentPublishTool);
