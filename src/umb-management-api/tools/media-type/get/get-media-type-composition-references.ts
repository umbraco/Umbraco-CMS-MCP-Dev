import { UmbracoManagementClient } from "@umb-management-client";
import { getMediaTypeByIdCompositionReferencesParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const GetMediaTypeCompositionReferencesTool = {
  name: "get-media-type-composition-references",
  description: "Gets the composition references for a media type",
  schema: getMediaTypeByIdCompositionReferencesParams.shape,
  isReadOnly: true,
  slices: ['read'],
  handler: async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getMediaTypeByIdCompositionReferences(id);

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response),
        },
      ],
    };
  },
} satisfies ToolDefinition<typeof getMediaTypeByIdCompositionReferencesParams.shape>;

export default withStandardDecorators(GetMediaTypeCompositionReferencesTool);
