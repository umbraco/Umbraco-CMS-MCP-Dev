import { ToolDefinition } from "types/tool-definition.js";
import { ToolCollectionExport } from "types/tool-collection.js";
import GetCulturesTool from "./get-cultures.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";

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
