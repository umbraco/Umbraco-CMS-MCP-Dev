import { UmbracoManagementClient } from "@umb-management-client";
import { CreateScriptRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import { AxiosResponse } from "axios";
import {
  type ToolDefinition,
  createToolResult,
  createToolResultError,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

const createScriptSchema = z.object({
  name: z.string().min(1, "Name is required"),
  path: z.string().optional(),
  content: z.string().min(1, "Content is required")
});

type CreateScriptSchema = z.infer<typeof createScriptSchema>;

export const createScriptOutputSchema = z.object({
  message: z.string(),
  path: z.string()
});

const CreateScriptTool = {
  name: "create-script",
  description: "Creates a new script",
  inputSchema: createScriptSchema.shape,
  outputSchema: createScriptOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: CreateScriptSchema) => {
    const client = UmbracoManagementClient.getClient();

    const normalizedPath = model.path && !model.path.startsWith('/')
      ? `/${model.path}`
      : model.path;

    const name = model.name.endsWith('.js')
      ? model.name
      : `${model.name}.js`;

    const payload: CreateScriptRequestModel = {
      name,
      content: model.content,
      parent: normalizedPath ? { path: normalizedPath } : undefined,
    };

    const response = await client.postScript(payload, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract path from Location header
      const locationHeader = response.headers['location'] || response.headers['Location'];
      let createdPath = '';
      if (locationHeader) {
        // Location header format: /umbraco/management/api/v1/script/{encodedPath}
        const pathMatch = locationHeader.match(/script\/(.+)$/);
        if (pathMatch) {
          createdPath = decodeURIComponent(pathMatch[1]);
        }
      }
      return createToolResult({
        message: "Script created successfully",
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
} satisfies ToolDefinition<typeof createScriptSchema.shape, typeof createScriptOutputSchema.shape>;

export default withStandardDecorators(CreateScriptTool);
