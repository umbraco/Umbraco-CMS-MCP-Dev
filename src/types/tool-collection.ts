import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";
import { ToolDefinition } from "./tool-definition.js";

export interface ToolCollectionMetadata {
  name: string;           // Collection key (e.g., 'culture', 'data-type')
  displayName: string;    // Human readable name
  description: string;    // Collection description
  dependencies?: string[]; // Required collections
}

export interface ToolCollectionExport {
  metadata: ToolCollectionMetadata;
  tools: (user: CurrentUserResponseModel) => ToolDefinition<any, any>[];
}