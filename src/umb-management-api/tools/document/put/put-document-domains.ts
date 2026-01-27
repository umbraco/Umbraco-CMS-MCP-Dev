import {
  putDocumentByIdDomainsParams,
  putDocumentByIdDomainsBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeVoidApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const inputSchema = {
  id: putDocumentByIdDomainsParams.shape.id,
  data: z.object(putDocumentByIdDomainsBody.shape),
};

const PutDocumentDomainsTool = {
  name: "put-document-domains",
  description: `Updates the domains assigned to a document by Id. Default value of the defaultIsoCode is null.
  Domain isoCode in the domains array should be in the format of 'en-US' amd be a valid domain name from the Umbraco instance.`,
  inputSchema: inputSchema,
  annotations: {
    idempotentHint: true,
  },
  slices: ['domains'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.CultureAndHostnames),
  handler: (async (model: { id: string; data: any }) => {
    return executeVoidApiCall((client) =>
      client.putDocumentByIdDomains(model.id, model.data, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof inputSchema>;

export default withStandardDecorators(PutDocumentDomainsTool);
