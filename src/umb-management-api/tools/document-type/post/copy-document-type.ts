import { UmbracoManagementClient } from "@umb-management-client";
import { postDocumentTypeByIdCopyBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { CreateUmbracoWriteTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";
import { CopyDocumentTypeRequestModel } from "@/umb-management-api/schemas/copyDocumentTypeRequestModel.js";

const CopyDocumentTypeTool = CreateUmbracoWriteTool(
  "copy-document-type",
  "Copy a document type to a new location",
  {
    id: z.string().uuid(),
    data: z.object(postDocumentTypeByIdCopyBody.shape),
  },
  async (model: { id: string; data: CopyDocumentTypeRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postDocumentTypeByIdCopy(
      model.id,
      model.data
    );

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

export default CopyDocumentTypeTool;
