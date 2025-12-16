import { UmbracoManagementClient } from "@umb-management-client";
import {
  putDocumentByIdDomainsParams,
  putDocumentByIdDomainsBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const putDocumentDomainsSchema = {
  id: putDocumentByIdDomainsParams.shape.id,
  data: z.object(putDocumentByIdDomainsBody.shape),
};

const PutDocumentDomainsTool = {
  name: "put-document-domains",
  description: `Updates the domains assigned to a document by Id. Default value of the defaultIsoCode is null.
  Domain isoCode in the domains array should be in the format of 'en-US' amd be a valid domain name from the Umbraco instance.`,
  schema: putDocumentDomainsSchema,
  isReadOnly: false,
  slices: ['domains'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.CultureAndHostnames),
  handler: async (model: { id: string; data: any }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.putDocumentByIdDomains(model.id, model.data);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof putDocumentDomainsSchema>;

export default withStandardDecorators(PutDocumentDomainsTool);
