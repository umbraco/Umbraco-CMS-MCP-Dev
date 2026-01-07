import { UmbracoManagementClient } from "@umb-management-client";
import { CreateStylesheetFolderRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { postStylesheetFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";
import { AxiosResponse } from "axios";

export const createStylesheetFolderOutputSchema = z.object({
  message: z.string(),
  path: z.string()
});

const CreateStylesheetFolderTool = {
  name: "create-stylesheet-folder",
  description: "Creates a new stylesheet folder",
  inputSchema: postStylesheetFolderBody.shape,
  outputSchema: createStylesheetFolderOutputSchema.shape,
  slices: ['create', 'folders'],
  handler: (async (model: CreateStylesheetFolderRequestModel) => {
    const client = UmbracoManagementClient.getClient();

    const response = await client.postStylesheetFolder(model, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract path from Location header
      const locationHeader = response.headers['location'] || response.headers['Location'];
      let createdPath = '';
      if (locationHeader) {
        // Location header format: /umbraco/management/api/v1/stylesheet/folder/{encodedPath}
        const pathMatch = locationHeader.match(/stylesheet\/folder\/(.+)$/);
        if (pathMatch) {
          createdPath = decodeURIComponent(pathMatch[1]);
        }
      }
      return createToolResult({
        message: "Stylesheet folder created successfully",
        path: createdPath
      });
    } else {
      const errorData: ProblemDetails = response.data || {
        status: response.status,
        detail: response.statusText,
      };
      return createToolResultError(errorData);
    }
  }),
} satisfies ToolDefinition<typeof postStylesheetFolderBody.shape, typeof createStylesheetFolderOutputSchema.shape>;

export default withStandardDecorators(CreateStylesheetFolderTool);
