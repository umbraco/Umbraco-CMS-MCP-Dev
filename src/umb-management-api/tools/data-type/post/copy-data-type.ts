import { CopyDataTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  postDataTypeByIdCopyParams,
  postDataTypeByIdCopyBody,
  getDataTypeByIdResponse,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators, executeGetOperation, FULL_RESPONSE_OPTIONS } from "@/helpers/mcp/tool-decorators.js";

const copyDataTypeSchema = {
  id: postDataTypeByIdCopyParams.shape.id,
  body: z.object(postDataTypeByIdCopyBody.shape),
};

const CopyDataTypeTool = {
  name: "copy-data-type",
  description: "Copy a data type by Id",
  inputSchema: copyDataTypeSchema,
  outputSchema: getDataTypeByIdResponse,
  slices: ['copy'],
  handler: (async ({ id, body }: { id: string; body: CopyDataTypeRequestModel }) => {
    return executeGetOperation((client) => 
      client.postDataTypeByIdCopy(id, body, FULL_RESPONSE_OPTIONS)
    );
  }),
} satisfies ToolDefinition<typeof copyDataTypeSchema, typeof getDataTypeByIdResponse>;

export default withStandardDecorators(CopyDataTypeTool);
