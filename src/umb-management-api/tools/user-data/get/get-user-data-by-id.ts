import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { getUserDataByIdParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const GetUserDataByIdTool = CreateUmbracoTool(
  "get-user-data-by-id",
  "Retrieves a specific personal key-value storage record by its unique identifier for the authenticated user. User data stores user preferences, settings, and configuration values that persist permanently and are organized by group (category) and identifier (key).",
  getUserDataByIdParams.shape,
  async ({ id }) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserDataById(id);

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

export default GetUserDataByIdTool;