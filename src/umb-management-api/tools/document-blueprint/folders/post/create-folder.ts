import { UmbracoManagementClient } from "@umb-management-client";
import { postDocumentBlueprintFolderBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import { z } from "zod";

type SchemaParams = z.infer<typeof postDocumentBlueprintFolderBody>;

const CreateDocumentBlueprintFolderTool = {
  name: "create-document-blueprint-folder",
  description: "Creates a new document blueprint folder",
  schema: postDocumentBlueprintFolderBody.shape,
  isReadOnly: false,
  slices: ['create', 'folders'],
  handler: async (model: SchemaParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.postDocumentBlueprintFolder(model);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof postDocumentBlueprintFolderBody.shape>;

export default withStandardDecorators(CreateDocumentBlueprintFolderTool);
