import { UmbracoManagementClient } from "@umb-management-client";
import { CreateStylesheetRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import { AxiosResponse } from "axios";
import {
  type ToolDefinition,
  createToolResult,
  createToolResultError,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Flattened schema - prevents LLM JSON stringification of parent object
const createStylesheetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  path: z.string().optional(),
  content: z.string().min(1, "Content is required")
});

type CreateStylesheetSchema = z.infer<typeof createStylesheetSchema>;

export const createStylesheetOutputSchema = z.object({
  message: z.string(),
  path: z.string()
});

const CreateStylesheetTool = {
  name: "create-stylesheet",
  description: `Creates a new stylesheet.`,
  inputSchema: createStylesheetSchema.shape,
  outputSchema: createStylesheetOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: CreateStylesheetSchema) => {
    const client = UmbracoManagementClient.getClient();

    // Normalize path to ensure it starts with /
    const normalizedPath = model.path && !model.path.startsWith('/')
      ? `/${model.path}`
      : model.path;

    // Ensure name ends with .css extension
    const name = model.name.endsWith('.css')
      ? model.name
      : `${model.name}.css`;

    // Transform: flat path -> nested parent object for API
    const payload: CreateStylesheetRequestModel = {
      name,
      content: model.content,
      parent: normalizedPath ? { path: normalizedPath } : undefined,
    };

    const response = await client.postStylesheet(payload, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract path from Location header
      const locationHeader = response.headers['location'] || response.headers['Location'];
      let createdPath = '';
      if (locationHeader) {
        // Location header format: /umbraco/management/api/v1/stylesheet/{encodedPath}
        const pathMatch = locationHeader.match(/stylesheet\/(.+)$/);
        if (pathMatch) {
          createdPath = decodeURIComponent(pathMatch[1]);
        }
      }
      return createToolResult({
        message: "Stylesheet created successfully",
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
} satisfies ToolDefinition<typeof createStylesheetSchema.shape, typeof createStylesheetOutputSchema.shape>;

export default withStandardDecorators(CreateStylesheetTool);
