import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { GetTagParams } from "@/umb-management-api/schemas/index.js";
import { getTagQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetTagsTool = CreateUmbracoTool(
  "get-tags",
  "Retrieves a paginated list of tags used in the Umbraco instance",
  getTagQueryParams.shape,
  async (params: GetTagParams) => {
    const client = UmbracoManagementClient.getClient();
    var response = await client.getTag(params);
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

export default GetTagsTool;