import { CopyDataTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  postDataTypeByIdCopyParams,
  postDataTypeByIdCopyBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeVoidApiCall, CAPTURE_RAW_HTTP_RESPONSE } from "@/helpers/mcp/tool-decorators.js";

const copyDataTypeSchema = {
  id: postDataTypeByIdCopyParams.shape.id,
  body: z.object(postDataTypeByIdCopyBody.shape),
};

const CopyDataTypeTool = {
  name: "copy-data-type",
  description: "Copy a data type by Id. Returns 201 Created on success.",
  inputSchema: copyDataTypeSchema,
  slices: ['copy'],
  handler: (async ({ id, body }: { id: string; body: CopyDataTypeRequestModel }) => {
    // Copy endpoint returns 201 with Location header, not a response body
    return executeVoidApiCall((client) =>
      client.postDataTypeByIdCopy(id, body, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof copyDataTypeSchema>;

export default withStandardDecorators(CopyDataTypeTool);
