import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";

const GetDocumentByIdTool = {
  name: "get-document-by-id",
  description: `Gets a document by id
  Use this to retrieve existing documents. When creating new documents,
  first get an existing document of similar type, then use the Copy document endpoint.`,
  schema: getDocumentByIdParams.shape,
  isReadOnly: true,
  slices: ['read'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Read),
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentById(id);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDocumentByIdParams.shape>;

export default withStandardDecorators(GetDocumentByIdTool);
