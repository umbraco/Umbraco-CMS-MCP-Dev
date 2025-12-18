import { UmbracoManagementClient } from "@umb-management-client";
import { postTemplateQueryExecuteBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ToolDefinition } from "types/tool-definition.js";
import { withStandardDecorators } from "@/helpers/mcp/tool-decorators.js";

const ExecuteTemplateQueryTool = {
  name: "execute-template-query",
  description: `Executes template queries and returns generated LINQ code with sample results and execution time.
  IMPORTANT: Always follow the example format exactly.
  Example:
  {"take": 5}
  or
  {
    "documentTypeAlias": "article",
    "filters": [{"propertyAlias": "Name", "constraintValue": "Blog", "operator": "Contains"},
    "take": 10
  }`,
  schema: postTemplateQueryExecuteBody.shape,
  isReadOnly: true,
  slices: ['templates'],
  handler: async (body: any) => {
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
  },
} satisfies ToolDefinition<typeof postTemplateQueryExecuteBody.shape>;

export default withStandardDecorators(ExecuteTemplateQueryTool);