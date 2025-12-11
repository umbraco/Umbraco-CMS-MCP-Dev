import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetModelsBuilderDashboardTool = CreateUmbracoReadTool(
  "get-models-builder-dashboard",
  `Gets Models Builder dashboard information and current status.
  Returns an object containing:
  - mode: The Models Builder mode, one of: 'Nothing', 'InMemoryAuto', 'SourceCodeManual', 'SourceCodeAuto' (string)
  - canGenerate: Whether models can be generated (boolean)
  - outOfDateModels: Whether models are out of date (boolean)
  - lastError: Last error message if any (string | null)
  - version: Version information (string | null)
  - modelsNamespace: Namespace for generated models (string | null)
  - trackingOutOfDateModels: Whether tracking is enabled (boolean)`,
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getModelsBuilderDashboard();

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

export default GetModelsBuilderDashboardTool;