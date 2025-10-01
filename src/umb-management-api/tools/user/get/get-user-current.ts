import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";

const GetUserCurrentTool = CreateUmbracoTool(
  "get-user-current",
  "Gets the current authenticated user's information",
  {}, // No parameters required
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getUserCurrent();

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

export default GetUserCurrentTool;