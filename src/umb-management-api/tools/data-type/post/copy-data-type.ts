import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { CopyDataTypeRequestModel } from "@/umb-management-api/schemas/index.js";
import {
  postDataTypeByIdCopyParams,
  postDataTypeByIdCopyBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";

const CopyDataTypeTool = CreateUmbracoTool(
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
