import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUmbracoReadTool } from "@/helpers/mcp/create-umbraco-tool.js";
import { postTemplateQueryExecuteBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const ExecuteTemplateQueryTool = CreateUmbracoReadTool(
  "execute-template-query",
  `Executes template queries and returns generated LINQ code with sample results and execution time. 
  IMPORTANT: Always follow the example format exactly.
  Example: 
  {"take": 5} 
  or 
  {
    "documentTypeAlias": "article", 
    "filters": [{"propertyAlias": "Name", "constraintValue": "Blog", "operator": "Contains"}, 
    "take": 10
  }`,
  postTemplateQueryExecuteBody.shape,
  async (body) => {
    const client = UmbracoManagementClient.getClient();
    const response = await client.postTemplateQueryExecute(body);

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

export default ExecuteTemplateQueryTool;