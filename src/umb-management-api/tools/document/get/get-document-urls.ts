import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentUrlsQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

const GetDocumentUrlsTool = {
  name: "get-document-urls",
  description: "Gets the URLs for a document.",
  schema: getDocumentUrlsQueryParams.shape,
  isReadOnly: true,
  slices: ['urls'],
  handler: async (params: z.infer<typeof getDocumentUrlsQueryParams>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentUrls(params);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getDocumentUrlsQueryParams.shape>;

export default withStandardDecorators(GetDocumentUrlsTool);
