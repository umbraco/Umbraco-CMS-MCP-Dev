import { DataTypeCollection } from "./data-type/index.js";
import { DocumentCollection } from "./document/index.js";
import { DocumentTypeCollection } from "./document-type/index.js";
import { ToolCollectionExport } from "types/tool-collection.js";

/**
 * Registry of all available tool collections.
 * Add new collections here when implementing new API endpoints.
 */
export const availableCollections: ToolCollectionExport[] = [
  DataTypeCollection,
  DocumentCollection,
  DocumentTypeCollection,
];
