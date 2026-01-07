import { UmbracoManagementClient } from "@umb-management-client";
import { z } from "zod";
import { ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";
import { AxiosResponse } from "axios";

const inputSchema = z.object({
  id: z.string().uuid(),
});

export const copyMemberTypeOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
});

const CopyMemberTypeTool = {
  name: "copy-member-type",
  description: "Copy a member type to a new location",
  inputSchema: inputSchema.shape,
  outputSchema: copyMemberTypeOutputSchema.shape,
  slices: ['copy'],
  handler: (async (model: { id: string }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postMemberTypeByIdCopy(model.id, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract ID from Location header
      const locationHeader = response.headers['location'] || response.headers['Location'];
      let createdId = '';
      if (locationHeader) {
        const idMatch = locationHeader.match(/([0-9a-f-]{36})$/i);
        if (idMatch) {
          createdId = idMatch[1];
        }
      }
      return createToolResult({
        message: "Member type copied successfully",
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
} satisfies ToolDefinition<typeof inputSchema.shape, typeof copyMemberTypeOutputSchema.shape>;

export default withStandardDecorators(CopyMemberTypeTool);
