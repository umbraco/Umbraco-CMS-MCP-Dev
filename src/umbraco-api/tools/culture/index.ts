import GetCulturesTool from "./get-cultures.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/index.js";
import {
  type ToolCollectionExport,
  type ToolDefinition,
} from "@umbraco-cms/mcp-server-sdk";

export const CultureCollection: ToolCollectionExport = {
  metadata: {
    name: 'culture',
    displayName: 'Culture & Localization',
    description: 'Culture and localization management',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    // Tools are now exported as objects (already decorated), not factory functions
    const tools: ToolDefinition<any, any>[] = [GetCulturesTool];
    return tools;
  }
};
