import { getTemporaryFileConfigurationResponse } from "@/umb-management-api/temporary-file/types.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const GetTemporaryFileConfigurationTool = {
  name: "get-temporary-file-configuration",
  description: `Gets the global configuration for temporary files
  This endpoint tells you the following
  - imageFileTypes - which files are considered as images
  - disallowedUploadedFilesExtensions - which file extensions are not allowed to be uploaded
  - allowedUploadedFileExtensions - which file extensions are allowed to be uploaded
  - maxFileSize - the maximum file size in bytes, if null then there is no limit
  `,
  inputSchema: {},
  outputSchema: getTemporaryFileConfigurationResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['read'],
  handler: (async () => {
    return executeGetApiCall((client) =>
      client.getTemporaryFileConfiguration(CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<{}, typeof getTemporaryFileConfigurationResponse.shape>;

export default withStandardDecorators(GetTemporaryFileConfigurationTool);
