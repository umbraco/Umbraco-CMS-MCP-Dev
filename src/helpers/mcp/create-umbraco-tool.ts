import { ZodRawShape } from "zod";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ToolDefinition } from "../../types/tool-definition.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import {
  getVersionCheckMessage,
  clearVersionCheckMessage,
  isToolExecutionBlocked
} from "../version-check/check-umbraco-version.js";

export const CreateUmbracoTool =
  <Args extends undefined | ZodRawShape = any>(
    name: string,
    description: string,
    schema: Args,
    handler: ToolCallback<Args>,
    enabled?: (user: CurrentUserResponseModel) => boolean
  ): (() => ToolDefinition<Args>) =>
  () => ({
    name: name,
    description: description,
    enabled: enabled,
    schema: schema,
    handler: (async (args: any, context: any) => {
      // If blocked, show warning and clear for next attempt
      if (isToolExecutionBlocked()) {
        const versionMessage = getVersionCheckMessage();
        clearVersionCheckMessage(); // Clears both message and blocking state
        return {
          content: [{
            type: "text" as const,
            text: `${versionMessage}\n\n⚠️ Tool execution paused due to version incompatibility.\n\nIf you understand the risks and want to proceed anyway, please retry your request.`,
          }],
          isError: true,
        };
      }

      try {
        return await handler(args, context);
      } catch (error) {
        console.error(`Error in tool ${name}:`, error);

        const errorDetails = error instanceof Error
          ? { message: error.message, cause: error.cause, response: (error as any).response?.data }
          : error;

        return {
          content: [{
            type: "text" as const,
            text: `Error using ${name}:\n${JSON.stringify(errorDetails, null, 2)}`,
          }],
        };
      }
    }) as ToolCallback<Args>,
  });
