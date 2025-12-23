import { ReadResourceTemplateCallback, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceTemplateDefinition } from "types/resource-template-definition.js";

/**
 * Factory for creating parameterized MCP resources (with URL template variables).
 *
 * Use for endpoints that accept parameters like pagination, filters, or IDs:
 * - List endpoints with skip/take
 * - Search endpoints with query parameters
 * - Tree navigation with parent ID
 *
 * For static resources (no parameters), use CreateUmbracoReadResource instead.
 *
 * @param name - Human-readable name shown in MCP clients
 * @param description - Description of what the resource returns
 * @param template - ResourceTemplate with URI pattern and completion hints
 * @param handler - Async function that fetches and returns the data
 * @returns Factory function that creates the ResourceTemplateDefinition
 *
 * @example
 * ```typescript
 * const GetDataTypeRoot = CreateUmbracoTemplateResource(
 *   "List Data Types at Root",
 *   "List data types at the root level",
 *   new ResourceTemplate(
 *     "umbraco://data-type/root?skip={skip}&take={take}",
 *     {
 *       list: undefined,
 *       complete: {
 *         skip: () => ["0", "10", "20"],
 *         take: () => ["10", "20", "50"]
 *       }
 *     }
 *   ),
 *   async (uri, variables) => {
 *     const client = UmbracoManagementClient.getClient();
 *     const params = schema.parse(variables);
 *     const response = await client.getTreeDataTypeRoot(params);
 *     return {
 *       contents: [{
 *         uri: uri.href,
 *         text: JSON.stringify(response, null, 2),
 *         mimeType: "application/json"
 *       }]
 *     };
 *   }
 * );
 * ```
 */
export const CreateUmbracoTemplateResource = (
  name: string,
  description: string,
  template: ResourceTemplate,
  handler: ReadResourceTemplateCallback
): (() => ResourceTemplateDefinition) =>
  () => ({
    name,
    description,
    template,
    handler
  }); 