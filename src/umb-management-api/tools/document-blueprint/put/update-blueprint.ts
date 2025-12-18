import { UmbracoManagementClient } from "@umb-management-client";
import { UpdateDocumentBlueprintRequestModel } from "@/umb-management-api/schemas/updateDocumentBlueprintRequestModel.js";
import {
  putDocumentBlueprintByIdParams,
  putDocumentBlueprintByIdBody,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const updateDocumentBlueprintSchema = {
  id: putDocumentBlueprintByIdParams.shape.id,
  data: z.object(putDocumentBlueprintByIdBody.shape),
};

const UpdateDocumentBlueprintTool = {
  name: "update-document-blueprint",
  description: "Updates a document blueprint by Id",
  schema: updateDocumentBlueprintSchema,
  isReadOnly: false,
  slices: ['update'],
  handler: async (model: { id: string; data: UpdateDocumentBlueprintRequestModel }) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.putDocumentBlueprintById(model.id, model.data);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof updateDocumentBlueprintSchema>;

export default withStandardDecorators(UpdateDocumentBlueprintTool);
