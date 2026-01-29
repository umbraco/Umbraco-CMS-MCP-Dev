import { UmbracoManagementClient } from "@umb-management-client";
import { CreateTemplateRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { postTemplateBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { AxiosResponse } from "axios";
import {
  type ToolDefinition,
  createToolResult,
  createToolResultError,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

export const createTemplateOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
});

const CreateTemplateTool = {
  name: "create-template",
  description: "Creates a new template",
  inputSchema: postTemplateBody.shape,
  outputSchema: createTemplateOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: CreateTemplateRequestModel) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postTemplate(model, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract ID from Location header
      const locationHeader = response.headers['location'] || response.headers['Location'];
      let createdId = '';
      if (locationHeader) {
        // Location header format: /umbraco/management/api/v1/template/{id}
        const idMatch = locationHeader.match(/template\/([a-f0-9-]+)$/i);
        if (idMatch) {
          createdId = idMatch[1];
        }
      }
      return createToolResult({
        message: "Template created successfully",
        id: createdId
      });
    } else {
      const errorData: ProblemDetails = response.data || {
        status: response.status,
        detail: response.statusText,
      };
      return createToolResultError(errorData);
    }
  }),
} satisfies ToolDefinition<typeof postTemplateBody.shape, typeof createTemplateOutputSchema.shape>;

export default withStandardDecorators(CreateTemplateTool);
