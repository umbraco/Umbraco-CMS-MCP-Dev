import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentByIdDomainsParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDocumentDomainsTool = {
  name: "get-document-domains",
  description: "Gets the domains assigned to a document by Id.",
  schema: getDocumentByIdDomainsParams.shape,
  isReadOnly: true,
  slices: ['domains'],
  handler: async ({ id }: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentByIdDomains(id);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDocumentByIdDomainsParams.shape>;

export default withStandardDecorators(GetDocumentDomainsTool);
