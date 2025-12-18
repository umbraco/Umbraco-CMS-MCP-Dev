import { UmbracoManagementClient } from "@umb-management-client";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";
import {
  getDocumentTypeByIdAllowedChildrenParams,
  getDocumentTypeByIdAllowedChildrenQueryParams,
} from "@/umb-management-api/umbracoManagementAPI.zod.js";

// Combine both parameter schemas
const paramSchema = getDocumentTypeByIdAllowedChildrenParams.merge(
  getDocumentTypeByIdAllowedChildrenQueryParams
);

const GetDocumentTypeAllowedChildrenTool = {
  name: "get-document-type-allowed-children",
  description: "Gets the document types that are allowed as children of a document type",
  schema: paramSchema.shape,
  isReadOnly: true,
  slices: ['configuration'],
  handler: async (model: { id: string; skip?: number; take?: number }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDocumentTypeByIdAllowedChildren(model.id, {
      skip: model.skip,
      take: model.take,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  }
} satisfies ToolDefinition<typeof paramSchema.shape>;

export default withStandardDecorators(GetDocumentTypeAllowedChildrenTool);
