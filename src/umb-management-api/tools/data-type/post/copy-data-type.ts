import { UmbracoManagementClient } from "@umb-management-client";
import { CopyDataTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  postDataTypeByIdCopyParams,
  postDataTypeByIdCopyBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const copyDataTypeSchema = {
  id: postDataTypeByIdCopyParams.shape.id,
  body: z.object(postDataTypeByIdCopyBody.shape),
};

const CopyDataTypeTool = {
  name: "copy-data-type",
  description: "Copy a data type by Id",
  schema: copyDataTypeSchema,
  isReadOnly: false,
  slices: ['copy'],
  handler: async ({ id, body }: { id: string; body: CopyDataTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postDataTypeByIdCopy(id, body);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof copyDataTypeSchema>;

export default withStandardDecorators(CopyDataTypeTool);
