import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";

const PostModelsBuilderBuildTool = CreateUmbracoTool(
  "post-models-builder-build",
  `Triggers the generation/build of Models Builder models.
  This endpoint initiates the process of generating strongly-typed models from Umbraco content types.
  The operation runs asynchronously and does not return any response data.

  Use this tool to:
  - Generate models after making changes to document types, media types, or member types
  - Refresh models when they become out of date
  - Ensure the latest content type definitions are reflected in generated models

  Note: This operation may take some time to complete depending on the number of content types.
  Use get-models-builder-dashboard or get-models-builder-status to check the current state and if new models need to be generated.`,
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    await client.postModelsBuilderBuild();

    return {
      content: [
        {
          type: "text" as const,
          text: "Models Builder build process initiated successfully.",
        },
      ],
    };
  }
);

export default PostModelsBuilderBuildTool;