import { UmbracoManagementClient } from "@umb-management-client";
import { putDocumentByIdUnpublishBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { UmbracoDocumentPermissions } from "../constants.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const unpublishDocumentSchema = {
  id: z.string().uuid(),
  data: z.object(putDocumentByIdUnpublishBody.shape),
};

const UnpublishDocumentTool = {
  name: "unpublish-document",
  description: "Unpublishes a document by Id.",
  schema: unpublishDocumentSchema,
  isReadOnly: false,
  slices: ['publish'],
  enabled: (user: CurrentUserResponseModel) => user.fallbackPermissions.includes(UmbracoDocumentPermissions.Unpublish),
  handler: async (model: {
    id: string;
    data: z.infer<typeof putDocumentByIdUnpublishBody>;
  }) => {
    const client = UmbracoManagementClient.getClient();
    if (!model.data.cultures) model.data.cultures = null;
    const response = await client.putDocumentByIdUnpublish(
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
  },
} satisfies ToolDefinition<typeof unpublishDocumentSchema>;

export default withStandardDecorators(UnpublishDocumentTool);
