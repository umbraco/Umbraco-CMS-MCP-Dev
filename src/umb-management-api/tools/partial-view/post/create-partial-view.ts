import { UmbracoManagementClient } from "@umb-management-client";
import { CreatePartialViewRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";
import { AxiosResponse } from "axios";

const createPartialViewSchema = z.object({
  name: z.string().min(1, "Name is required"),
  path: z.string().optional(),
  content: z.string().min(1, "Content is required")
});

type CreatePartialViewSchema = z.infer<typeof createPartialViewSchema>;

export const createPartialViewOutputSchema = z.object({
  message: z.string(),
  path: z.string()
});

const CreatePartialViewTool = {
  name: "create-partial-view",
  description: "Creates a new partial view",
  inputSchema: createPartialViewSchema.shape,
  outputSchema: createPartialViewOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: CreatePartialViewSchema) => {
    const client = UmbracoManagementClient.getClient();

    const normalizedPath = model.path && !model.path.startsWith('/')
      ? `/${model.path}`
      : model.path;

    const name = model.name.endsWith('.cshtml')
      ? model.name
      : `${model.name}.cshtml`;

    const content = model.content.replace(/(\r\n|\n|\r)/g, "");

    const payload: CreatePartialViewRequestModel = {
      name,
      content,
      parent: normalizedPath ? { path: normalizedPath } : undefined,
    };

    const response = await client.postPartialView(payload, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract path from Location header
      const locationHeader = response.headers['location'] || response.headers['Location'];
      let createdPath = '';
      if (locationHeader) {
        // Location header format: /umbraco/management/api/v1/partial-view/{encodedPath}
        const pathMatch = locationHeader.match(/partial-view\/(.+)$/);
        if (pathMatch) {
          createdPath = decodeURIComponent(pathMatch[1]);
        }
      }
      return createToolResult({
        message: "Partial view created successfully",
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
} satisfies ToolDefinition<typeof createPartialViewSchema.shape, typeof createPartialViewOutputSchema.shape>;

export default withStandardDecorators(CreatePartialViewTool);