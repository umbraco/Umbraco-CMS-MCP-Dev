import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetTemporaryFileConfigurationTool = {
  name: "get-temporary-file-configuration",
  description: `Gets the global configuration for temporary files
  This endpoint tells you the following
  - imageFileTypes - which files are considered as images
  - disallowedUploadedFilesExtensions - which file extensions are not allowed to be uploaded
  - allowedUploadedFileExtensions - which file extensions are allowed to be uploaded
  - maxFileSize - the maximum file size in bytes, if null then there is no limit
  `,
  schema: {},
  isReadOnly: true,
  slices: ['read'],
  handler: async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTemporaryFileConfiguration();
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

export default withStandardDecorators(GetTemporaryFileConfigurationTool);
