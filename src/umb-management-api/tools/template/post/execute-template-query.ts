import { TemplateQueryExecuteModel } from "@/umb-management-api/schemas/index.js";
import { postTemplateQueryExecuteBody, postTemplateQueryExecuteResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import {
  type ToolDefinition,
  CAPTURE_RAW_HTTP_RESPONSE,
  executeGetApiCall,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

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
  inputSchema: postTemplateQueryExecuteBody.shape,
  outputSchema: postTemplateQueryExecuteResponse.shape,
  annotations: { readOnlyHint: true },
  slices: ['templates'],
  handler: (async (body: TemplateQueryExecuteModel) => {
    return executeGetApiCall((client) =>
      client.postTemplateQueryExecute(body, CAPTURE_RAW_HTTP_RESPONSE)
    );
  }),
} satisfies ToolDefinition<typeof postTemplateQueryExecuteBody.shape, typeof postTemplateQueryExecuteResponse.shape>;

export default withStandardDecorators(ExecuteTemplateQueryTool);