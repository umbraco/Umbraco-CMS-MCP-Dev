import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";

const GetTemporaryFileConfigurationTool = CreateUmbracoReadTool(
  "get-temporary-file-configuration",
  `Gets the global configuration for temporary files
  This endpoint tells you the following
  - imageFileTypes - which files are considered as images
  - disallowedUploadedFilesExtensions - which file extensions are not allowed to be uploaded
  - allowedUploadedFileExtensions - which file extensions are allowed to be uploaded
  - maxFileSize - the maximum file size in bytes, if null then there is no limit
  `,
  {},
  async () => {
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
);

export default GetTemporaryFileConfigurationTool;
