import { CultureCollection } from "./culture/index.js";
import { DataTypeCollection } from "./data-type/index.js";
import { DictionaryCollection } from "./dictionary/index.js";
import { DocumentBlueprintCollection } from "./document-blueprint/index.js";
import { DocumentCollection } from "./document/index.js";
import { DocumentTypeCollection } from "./document-type/index.js";
import { DocumentVersionCollection } from "./document-version/index.js";
import { HealthCollection } from "./health/index.js";
import { ImagingCollection } from "./imaging/index.js";
import { IndexerCollection } from "./indexer/index.js";
import { LanguageCollection } from "./language/index.js";
import { LogViewerCollection } from "./log-viewer/index.js";
import { ManifestCollection } from "./manifest/index.js";
import { MediaCollection } from "./media/index.js";
import { MediaTypeCollection } from "./media-type/index.js";
import { MemberCollection } from "./member/index.js";
import { MemberGroupCollection } from "./member-group/index.js";
import { MemberTypeCollection } from "./member-type/index.js";
import { ModelsBuilderCollection } from "./models-builder/index.js";
import { PartialViewCollection } from "./partial-view/index.js";
import { PropertyTypeCollection } from "./property-type/index.js";
import { RedirectCollection } from "./redirect/index.js";
import { RelationCollection } from "./relation/index.js";
import { RelationTypeCollection } from "./relation-type/index.js";
import { ScriptCollection } from "./script/index.js";
import { SearcherCollection } from "./searcher/index.js";
import { ServerCollection } from "./server/index.js";
import { StaticFileCollection } from "./static-file/index.js";
import { StylesheetCollection } from "./stylesheet/index.js";
import { TagCollection } from "./tag/index.js";
import { TemplateCollection } from "./template/index.js";
import { TemporaryFileCollection } from "./temporary-file/index.js";
import { UserCollection } from "./user/index.js";
import { UserDataCollection } from "./user-data/index.js";
import { UserGroupCollection } from "./user-group/index.js";
import { WebhookCollection } from "./webhook/index.js";
import type { ToolCollectionExport } from "@umbraco-cms/mcp-server-sdk";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js";

/**
 * Registry of all available tool collections.
 * Add new collections here when implementing new API endpoints.
 */
export const availableCollections: ToolCollectionExport[] = [
  CultureCollection,
  DataTypeCollection,
  DictionaryCollection,
  DocumentBlueprintCollection,
  DocumentCollection,
  DocumentTypeCollection,
  DocumentVersionCollection,
  HealthCollection,
  ImagingCollection,
  IndexerCollection,
  LanguageCollection,
  LogViewerCollection,
  ManifestCollection,
  MediaCollection,
  MediaTypeCollection,
  MemberCollection,
  MemberGroupCollection,
  MemberTypeCollection,
  ModelsBuilderCollection,
  PartialViewCollection,
  PropertyTypeCollection,
  RedirectCollection,
  RelationCollection,
  RelationTypeCollection,
  ScriptCollection,
  SearcherCollection,
  ServerCollection,
  StaticFileCollection,
  StylesheetCollection,
  TagCollection,
  TemplateCollection,
  TemporaryFileCollection,
  UserCollection,
  UserDataCollection,
  UserGroupCollection,
  WebhookCollection,
];
