import { UmbracoManagementClient } from "@umb-management-client";
import { CreateScriptFolderRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { postScriptFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { AxiosResponse } from "axios";
import {
  type ToolDefinition,
  createToolResult,
  createToolResultError,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

export const createScriptFolderOutputSchema = z.object({
  message: z.string(),
  path: z.string()
});

const CreateScriptFolderTool = {
  name: "create-script-folder",
  description: "Creates a new script folder",
  inputSchema: postScriptFolderBody.shape,
  outputSchema: createScriptFolderOutputSchema.shape,
  slices: ['create', 'folders'],
  handler: (async (model: CreateScriptFolderRequestModel) => {
    const client = UmbracoManagementClient.getClient();

    const response = await client.postScriptFolder(model, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract path from Location header
      const locationHeader = response.headers['location'] || response.headers['Location'];
      let createdPath = '';
      if (locationHeader) {
        // Location header format: /umbraco/management/api/v1/script/folder/{encodedPath}
        const pathMatch = locationHeader.match(/script\/folder\/(.+)$/);
        if (pathMatch) {
          createdPath = decodeURIComponent(pathMatch[1]);
        }
      }
      return createToolResult({
        message: "Script folder created successfully",
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
} satisfies ToolDefinition<typeof postScriptFolderBody.shape, typeof createScriptFolderOutputSchema.shape>;

export default withStandardDecorators(CreateScriptFolderTool);
