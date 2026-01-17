import { UmbracoManagementClient } from "@umb-management-client";
import { CreateMemberGroupRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import { postMemberGroupBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { AxiosResponse } from "axios";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  createToolResult,
  createToolResultError,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

export const createOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
});

const CreateMemberGroupTool = {
  name: "create-member-group",
  description: "Creates a new member group",
  inputSchema: postMemberGroupBody.shape,
  outputSchema: createOutputSchema.shape,
  slices: ['create'],
  handler: (async (model: CreateMemberGroupRequestModel) => {
    const client = UmbracoManagementClient.getClient();

    // Generate ID if not provided
    const memberGroupId = model.id || uuidv4();
    const payload = { ...model, id: memberGroupId };

    const response = await client.postMemberGroup(payload, CAPTURE_RAW_HTTP_RESPONSE) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      return createToolResult({
        message: "Member group created successfully",
        id: memberGroupId
      });
    } else {
      return createToolResultError(response.data || {
        status: response.status,
        detail: response.statusText
      });
    }
  }),
} satisfies ToolDefinition<typeof postMemberGroupBody.shape, typeof createOutputSchema.shape>;

export default withStandardDecorators(CreateMemberGroupTool);
