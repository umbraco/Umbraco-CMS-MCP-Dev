import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { z } from "zod";

const GetDataTypeConfigurationTool = CreateUmbracoTool(
  "get-data-type-configuration",
  "Gets global data type configuration settings including change permissions and default list view IDs",
  {},
  async () => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getDataTypeConfiguration();

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }
);

export default GetDataTypeConfigurationTool;