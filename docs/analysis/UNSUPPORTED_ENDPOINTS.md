# Umbraco MCP Endpoint Coverage Report

Generated: 2025-09-25 (Updated for complete Media and User endpoint implementations)

## Executive Summary

- **Total API Endpoints**: 401
- **Implemented Endpoints**: 296
- **Ignored Endpoints**: 47 (see [IGNORED_ENDPOINTS.md](./IGNORED_ENDPOINTS.md))
- **Effective Coverage**: 83.6% (296 of 354 non-ignored)
- **Actually Missing**: 58

## Coverage Status by API Group

### ✅ Complete (100% Coverage - excluding ignored) - 19 groups
- Culture
- DataType
- Dictionary (import/export ignored)
- DocumentType (import/export ignored)
- Language
- LogViewer
- Media
- MediaType (import/export ignored)
- Member
- PartialView
- PropertyType
- RedirectManagement
- Script
- Server
- Stylesheet
- Template
- UmbracoManagement
- User (22 security-sensitive endpoints excluded)
- Webhook

### ⚠️ Nearly Complete (80-99% Coverage) - 0 groups

### 🔶 Partial Coverage (1-79%) - 2 groups
- Document: 42/57 (74%)
- RelationType: 1/3 (33%)

### ❌ Not Implemented (0% Coverage) - 21 groups
- Upgrade
- Telemetry
- Tag
- StaticFile
- Segment
- Security
- Searcher
- Relation
- PublishedCache
- Profiling
- Preview
- Oembed
- Object
- ModelsBuilder
- Manifest
- Install
- Indexer
- Imaging
- Help
- Health
- Dynamic

## Priority Implementation Recommendations

### 1. High Priority Groups (Core Functionality)
These groups represent core Umbraco functionality and should be prioritized:

#### User (100% complete, all safe endpoints implemented)
All safe User Management API endpoints are now implemented. Security-sensitive endpoints (22 total) remain excluded for security reasons as documented in [IGNORED_ENDPOINTS.md](./IGNORED_ENDPOINTS.md).

#### Media (100% complete, all endpoints implemented)
All Media Management API endpoints are now implemented.

#### Document (74% complete, missing 15 endpoints)
- `getCollectionDocumentById`
- `getDocumentAreReferenced`
- `getDocumentBlueprintByIdScaffold`
- `getDocumentByIdPublishWithDescendantsResultByTaskId`
- `getDocumentByIdReferencedBy`
- ... and 6 more

## Detailed Missing Endpoints by Group

### Document (Missing 15 endpoints)
- `getCollectionDocumentById`
- `getDocumentAreReferenced`
- `getDocumentBlueprintByIdScaffold`
- `getDocumentByIdPublishWithDescendantsResultByTaskId`
- `getDocumentByIdReferencedBy`
- `getDocumentByIdReferencedDescendants`
- `getItemDocument`
- `getRecycleBinDocumentByIdOriginalParent`
- `getRecycleBinDocumentReferencedBy`
- `getTreeDocumentBlueprintAncestors`
- `getTreeDocumentBlueprintChildren`
- `getTreeDocumentBlueprintRoot`
- `postDocumentBlueprintFromDocument`

### MediaType (Missing 1 endpoint)
- `getItemMediaTypeFolders`

### Media (Missing 3 endpoints)
- `deleteRecycleBinMedia`
- `getRecycleBinMediaByIdOriginalParent`
- `postMediaValidate`

### RelationType (Missing 2 endpoints)
- `getItemRelationType`
- `getRelationTypeById`

### Upgrade (Missing 2 endpoints)
- `getUpgradeSettings`
- `postUpgradeAuthorize`

### Telemetry (Missing 3 endpoints)
- `getTelemetry`
- `getTelemetryLevel`
- `postTelemetryLevel`

### Tag (Missing 1 endpoints)
- `getTag`

### StaticFile (Missing 4 endpoints)
- `getItemStaticFile`
- `getTreeStaticFileAncestors`
- `getTreeStaticFileChildren`
- `getTreeStaticFileRoot`

### Segment (Missing 1 endpoints)
- `getSegment`


### Searcher (Missing 2 endpoints)
- `getSearcher`
- `getSearcherBySearcherNameQuery`

### Relation (Missing 1 endpoints)
- `getRelationByRelationTypeId`

### PublishedCache (Missing 3 endpoints)
- `getPublishedCacheRebuildStatus`
- `postPublishedCacheRebuild`
- `postPublishedCacheReload`

### Profiling (Missing 2 endpoints)
- `getProfilingStatus`
- `putProfilingStatus`

### Preview (Missing 2 endpoints)
- `deletePreview`
- `postPreview`


### Oembed (Missing 1 endpoints)
- `getOembedQuery`

### Object (Missing 1 endpoints)
- `getObjectTypes`

### ModelsBuilder (Missing 3 endpoints)
- `getModelsBuilderDashboard`
- `getModelsBuilderStatus`
- `postModelsBuilderBuild`

### Manifest (Missing 3 endpoints)
- `getManifestManifest`
- `getManifestManifestPrivate`
- `getManifestManifestPublic`

### Install (Missing 3 endpoints)
- `getInstallSettings`
- `postInstallSetup`
- `postInstallValidateDatabase`

### Indexer (Missing 3 endpoints)
- `getIndexer`
- `getIndexerByIndexName`
- `postIndexerByIndexNameRebuild`


### Imaging (Missing 1 endpoints)
- `getImagingResizeUrls`

### Help (Missing 1 endpoints)
- `getHelp`

### Health (Missing 4 endpoints)
- `getHealthCheckGroup`
- `getHealthCheckGroupByName`
- `postHealthCheckExecuteAction`
- `postHealthCheckGroupByNameCheck`

### Dynamic (Missing 2 endpoints)
- `getDynamicRootSteps`
- `postDynamicRootQuery`

## Implementation Notes

1. **User Management**: ✅ Complete coverage (22 endpoints excluded for security). Implemented:
   - User read operations (admin-controlled, no creation/deletion/updates)
   - User permissions and access queries
   - User data management
   - Avatar management
   - Current user operations


3. **Health & Monitoring**: No coverage for:
   - Health checks
   - Profiling
   - Telemetry
   - Server monitoring

4. **Installation & Setup**: Missing all installation endpoints

5. **Security Features**: No implementation for security configuration and password management

## Recommendations

1. **Immediate Priority**: Complete the remaining partially-complete groups (Document at 74%, RelationType at 33%)
2. **High Priority**: Add Document management endpoints (15 remaining endpoints)
3. **Security Review**: ✅ User endpoints complete (22 endpoints permanently excluded for security reasons)
4. **Medium Priority**: Add Health and monitoring endpoints
5. **Low Priority**: Installation, Telemetry, and other utility endpoints

## Coverage Progress Tracking

To improve coverage:
1. Focus on completing groups that are already 80%+ implemented
2. Prioritize based on typical Umbraco usage patterns
3. Consider grouping related endpoints for batch implementation
4. Ensure comprehensive testing for each new endpoint

## Note on Tool Naming

Some tools use different naming conventions than their corresponding API endpoints:
- Search tools may map to `getItem*` endpoints
- By-id-array tools may map to `getItem*` endpoints
- This can cause discrepancies in automated coverage analysis

## Ignored Endpoints

Some endpoints are intentionally not implemented. See [IGNORED_ENDPOINTS.md](./IGNORED_ENDPOINTS.md) for:
- List of 9 ignored endpoints (all import/export related)
- Rationale for exclusion
- Coverage statistics exclude these endpoints from calculations

Ignored groups now showing 100% coverage:
- Dictionary (2 import/export endpoints ignored)
- DocumentType (3 import/export endpoints ignored)
- MediaType (3 import/export endpoints ignored)
- Import (1 analysis endpoint ignored)
