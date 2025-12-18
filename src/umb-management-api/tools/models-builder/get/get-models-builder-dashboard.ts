import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetModelsBuilderDashboardTool = {
  name: "get-models-builder-dashboard",
  description: `Gets Models Builder dashboard information and current status.
  Returns an object containing:
  - mode: The Models Builder mode, one of: 'Nothing', 'InMemoryAuto', 'SourceCodeManual', 'SourceCodeAuto' (string)
  - canGenerate: Whether models can be generated (boolean)
  - outOfDateModels: Whether models are out of date (boolean)
  - lastError: Last error message if any (string | null)
  - version: Version information (string | null)
  - modelsNamespace: Namespace for generated models (string | null)
  - trackingOutOfDateModels: Whether tracking is enabled (boolean)`,
  schema: {},
  isReadOnly: true,
  slices: ['diagnostics'],
  handler: async () => {
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
} satisfies ToolDefinition<{}>;

export default withStandardDecorators(GetModelsBuilderDashboardTool);