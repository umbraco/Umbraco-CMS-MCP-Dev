import { getDocumentByIdDomainsParams, getDocumentByIdDomainsResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const GetDocumentDomainsTool = {
  name: "get-document-domains",
  description: "Gets the domains assigned to a document by Id.",
  inputSchema: getDocumentByIdDomainsParams.shape,
  outputSchema: getDocumentByIdDomainsResponse.shape,
  annotations: {
    readOnlyHint: true,
  },
  slices: ['domains'],
  handler: (async ({ id }: { id: string }) => {
    return executeGetApiCall((client) =>
      client.getDocumentByIdDomains(id, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof getDocumentByIdDomainsParams.shape, typeof getDocumentByIdDomainsResponse.shape>;

export default withStandardDecorators(GetDocumentDomainsTool);
