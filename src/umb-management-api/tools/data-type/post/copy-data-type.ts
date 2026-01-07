import { UmbracoManagementClient } from "@umb-management-client";
import { CopyDataTypeRequestModel, ProblemDetails } from "@/umb-management-api/schemas/index.js";
import {
  postDataTypeByIdCopyParams,
  postDataTypeByIdCopyBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { AxiosResponse } from "axios";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, createToolResult, createToolResultError } from "@/helpers/mcp/tool-decorators.js";

const copyDataTypeSchema = {
  id: postDataTypeByIdCopyParams.shape.id,
  body: z.object(postDataTypeByIdCopyBody.shape),
};

export const copyDataTypeOutputSchema = z.object({
  message: z.string(),
  id: z.string().uuid()
});

const CopyDataTypeTool = {
  name: "copy-data-type",
  description: "Copy a data type by Id. Returns the new data type's ID on success.",
  inputSchema: copyDataTypeSchema,
  outputSchema: copyDataTypeOutputSchema.shape,
  slices: ['copy'],
  handler: (async ({ id, body }: { id: string; body: CopyDataTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();

    const response = await client.postDataTypeByIdCopy(id, body, {
      returnFullResponse: true,
      validateStatus: () => true,
    }) as unknown as AxiosResponse<ProblemDetails | void>;

    if (response.status === 201) {
      // Extract new ID from Location header: /umbraco/management/api/v1/data-type/{guid}
      const location = response.headers?.location || '';
      const newId = location.split('/').pop() || '';

      const output = {
        message: "Data type copied successfully",
        id: newId
      };
      return createToolResult(output);
    } else {
      const errorData: ProblemDetails = response.data || {
        status: response.status,
        detail: response.statusText,
      };
      return createToolResultError(errorData);
    }
  }),
} satisfies ToolDefinition<typeof copyDataTypeSchema, typeof copyDataTypeOutputSchema.shape>;

export default withStandardDecorators(CopyDataTypeTool);
