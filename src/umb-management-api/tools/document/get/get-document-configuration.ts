import { UmbracoManagementClient } from "@umb-management-client";
import { getDocumentConfigurationResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetDocumentConfigurationTool = {
  name: "get-document-configuration",
  description: "Gets the document configuration for the Umbraco instance.",
  schema: {},
  isReadOnly: true,
  slices: ['configuration'],
  handler: async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentConfiguration();

    getDocumentConfigurationResponse.parse(response);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<{}>;

export default withStandardDecorators(GetDocumentConfigurationTool);
