import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetModelsBuilderStatusTool = CreateUmbracoTool(
  "get-models-builder-status",
  `Gets the out-of-date status of Models Builder models.
  Returns an object containing:
  - status: The out-of-date status, one of: 'OutOfDate', 'Current', 'Unknown' (string)`,
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getModelsBuilderStatus();

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
);

export default GetModelsBuilderStatusTool;