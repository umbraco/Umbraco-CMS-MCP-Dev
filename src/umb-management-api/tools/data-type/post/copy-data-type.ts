import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { CopyDataTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  postDataTypeByIdCopyParams,
  postDataTypeByIdCopyBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const CopyDataTypeTool = CreateUmbracoWriteTool(
  "copy-data-type",
  "Copy a data type by Id",
  {
    id: postDataTypeByIdCopyParams.shape.id,
    body: z.object(postDataTypeByIdCopyBody.shape),
  },
  async ({ id, body }: { id: string; body: CopyDataTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.postDataTypeByIdCopy(id, body);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
);

export default CopyDataTypeTool;
