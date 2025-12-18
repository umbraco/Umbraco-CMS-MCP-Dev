import { UmbracoManagementClient } from "@umb-management-client";
import { getCollectionDocumentByIdParams, getCollectionDocumentByIdQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { z } from "zod";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const schema = z.object({
  ...getCollectionDocumentByIdParams.shape,
  ...getCollectionDocumentByIdQueryParams.shape,
});

const GetCollectionDocumentByIdTool = {
  name: "get-collection-document-by-id",
  description: `Get a collection of document items
  Use this to retrieve a filtered and paginated collection of document items based on various criteria like data type, ordering, and filtering.`,
  schema: schema.shape,
  isReadOnly: true,
  slices: ['search'],
  handler: async ({ id, dataTypeId, orderBy, orderDirection, filter, skip, take }: z.infer<typeof schema>) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getCollectionDocumentById(id, {
      dataTypeId,
      orderBy,
      orderDirection,
      filter,
      skip,
      take
    });
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof schema.shape>;

export default withStandardDecorators(GetCollectionDocumentByIdTool);