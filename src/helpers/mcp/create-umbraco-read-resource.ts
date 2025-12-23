import { ReadResourceCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ResourceDefinition } from "../../types/resource-definition.js";

/**
 * Factory for creating static MCP resources (read-only, no parameters).
 *
 * Use for endpoints that always return the same data structure:
 * - Default language
 * - Server info
 * - Configuration settings
 *
 * For parameterized resources (pagination, filters), use CreateUmbracoTemplateResource instead.
 *
 * @param uri - The resource URI (e.g., "umbraco://item/language/default")
 * @param name - Human-readable name shown in MCP clients
 * @param description - Description of what the resource returns
 * @param handler - Async function that fetches and returns the data
 * @returns Factory function that creates the ResourceDefinition
 *
 * @example
 * ```typescript
 * const GetDefaultLanguage = CreateUmbracoReadResource(
 *   "umbraco://item/language/default",
 *   "Default language",
 *   "Gets the default language for the Umbraco instance",
 *   async (uri) => {
 *     const client = UmbracoManagementClient.getClient();
 *     const response = await client.getItemLanguageDefault();
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
export const CreateUmbracoReadResource =
  (
    uri: string,
    name: string,
    description: string,
    handler: ReadResourceCallback
  ): (() => ResourceDefinition) =>
    () => ({
      uri,
      name,
      description,
      handler
    });