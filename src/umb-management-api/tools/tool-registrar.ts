import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import {
  type CollectionConfiguration,
  type ToolDefinition,
  createToolAnnotations,
} from "@umbraco-cms/mcp-server-sdk";

/**
 * Handles tool filtering and registration with the MCP server.
 */
export const ToolRegistrar = {
  /**
   * Check if a tool is allowed based on its explicit slice assignments.
   * Tools with empty slices array are ALWAYS included.
   */
  isToolAllowedBySlices: (
    toolSlices: string[],
    enabledSlices: string[],
    disabledSlices: string[]
  ): boolean => {
    // Tools with empty slices array are ALWAYS included
    if (toolSlices.length === 0) {
      return true;
    }

    // Check if ANY of the tool's slices is in the disabled list
    if (disabledSlices.length > 0) {
      if (toolSlices.some(slice => disabledSlices.includes(slice))) {
        return false;
      }
    }

    // If enabled slices specified, ALL of the tool's slices must be in the enabled list
    if (enabledSlices.length > 0) {
      return toolSlices.every(slice => enabledSlices.includes(slice));
    }

    return true;
  },

  /**
   * Registers tools with the MCP server, applying filtering based on config and permissions.
   */
  registerTools: (
    server: McpServer,
    user: CurrentUserResponseModel,
    tools: ToolDefinition<any, any>[],
    config: CollectionConfiguration,
    readonlyMode: boolean,
    filteredTools: string[]
  ): void => {
    tools.forEach(tool => {
      // Check if user has permission for this tool
      const userHasPermission = (tool.enabled === undefined || tool.enabled(user));
      if (!userHasPermission) return;

      // Readonly mode filter - skip write tools
      // readOnlyHint is required in annotations (defaults to false if not provided)
      const readOnlyHint = tool.annotations?.readOnlyHint ?? false;
      if (readonlyMode && !readOnlyHint) {
        filteredTools.push(tool.name);
        return;
      }

      // Apply slice-level filtering using explicit slice assignments
      if (!ToolRegistrar.isToolAllowedBySlices(tool.slices, config.enabledSlices, config.disabledSlices)) {
        return;
      }

      // Apply tool-level filtering from configuration
      if (config.disabledTools?.includes(tool.name)) return;
      if (config.enabledTools?.length && !config.enabledTools.includes(tool.name)) return;

      // Build annotations from tool definition
      // openWorldHint is always true since all tools use the Umbraco API
      const annotations = createToolAnnotations(tool);

      // Register the tool using the new registerTool API (supports outputSchema and annotations)
      server.registerTool(tool.name, {
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
        annotations,
      }, tool.handler);
    });
  },
};
