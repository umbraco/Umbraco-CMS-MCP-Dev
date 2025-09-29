# Umbraco MCP Endpoint Coverage Report

Generated: 2025-09-28 (Updated for complete Media, User, Health, StaticFile, and Manifest endpoint implementations)

## Executive Summary

- **Total API Endpoints**: 401
- **Implemented Endpoints**: 325
- **Ignored Endpoints**: 69 (see [IGNORED_ENDPOINTS.md](./IGNORED_ENDPOINTS.md))
- **Effective Coverage**: 95.9% (325 of 339 non-ignored)
- **Actually Missing**: 14

## Coverage Status by API Group

### ✅ Complete (100% Coverage - excluding ignored) - 27 groups
- Culture
- DataType
- Dictionary (import/export ignored)
- Document
- DocumentType (import/export ignored)
- Health
- Install (3 system setup endpoints ignored)
- Language
- LogViewer
- Manifest
- Media
- MediaType (import/export ignored)
- Member
- PartialView
- PropertyType
- PublishedCache (3 system performance endpoints ignored)
- RedirectManagement
- Script
- Server
- StaticFile
- Stylesheet
- Tag
- Telemetry (3 privacy-sensitive endpoints ignored)
- Template
- UmbracoManagement
- Upgrade (2 system setup endpoints ignored)
- User (22 security-sensitive endpoints excluded)
- Webhook

### ⚠️ Nearly Complete (80-99% Coverage) - 0 groups

### 🔶 Partial Coverage (1-79%) - 1 group
- RelationType: 1/3 (33%)

### ❌ Not Implemented (0% Coverage) - 8 groups
- Segment
- Security
- Searcher
- Relation
- ModelsBuilder
- Indexer
- Imaging
- Help

## Priority Implementation Recommendations

### 1. High Priority Groups (Core Functionality)
These groups represent core Umbraco functionality and should be prioritized:

#### User (100% complete, all safe endpoints implemented)
All safe User Management API endpoints are now implemented. Security-sensitive endpoints (22 total) remain excluded for security reasons as documented in [IGNORED_ENDPOINTS.md](./IGNORED_ENDPOINTS.md).

#### Media (100% complete, all endpoints implemented)
All Media Management API endpoints are now implemented.

#### Document (100% complete, all endpoints implemented)
All Document Management API endpoints are now implemented.

#### Health (100% complete, all endpoints implemented)
All Health Check Management API endpoints are now implemented.

#### StaticFile (100% complete, all endpoints implemented)
All StaticFile Management API endpoints are now implemented.


## Detailed Missing Endpoints by Group



### RelationType (Missing 2 endpoints)
- `getItemRelationType`
- `getRelationTypeById`

### Segment (Missing 1 endpoints)
- `getSegment`

### Searcher (Missing 2 endpoints)
- `getSearcher`
- `getSearcherBySearcherNameQuery`

### Relation (Missing 1 endpoints)
- `getRelationByRelationTypeId`

### ModelsBuilder (Missing 3 endpoints)
- `getModelsBuilderDashboard`
- `getModelsBuilderStatus`
- `postModelsBuilderBuild`

### Indexer (Missing 3 endpoints)
- `getIndexer`
- `getIndexerByIndexName`
- `postIndexerByIndexNameRebuild`

### Imaging (Missing 1 endpoints)
- `getImagingResizeUrls`

### Help (Missing 1 endpoints)
- `getHelp`



## Implementation Notes

1. **User Management**: ✅ Complete coverage (22 endpoints excluded for security). Implemented:
   - User read operations (admin-controlled, no creation/deletion/updates)
   - User permissions and access queries
   - User data management
   - Avatar management
   - Current user operations


3. **Health & Monitoring**: ✅ Health checks complete. Missing:
   - Profiling
   - Telemetry
   - Server monitoring

4. **Installation & Setup**: Missing all installation endpoints

5. **Security Features**: No implementation for security configuration and password management

## Recommendations

1. **Immediate Priority**: Complete the remaining partially-complete groups (RelationType at 33%)
2. **High Priority**: ✅ Document group now complete (100% coverage achieved)
3. **Security Review**: ✅ User endpoints complete (22 endpoints permanently excluded for security reasons)
4. **Medium Priority**: ✅ Health endpoints complete. Add remaining monitoring endpoints (Profiling)
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
- List of 53 ignored endpoints (import/export, security, privacy, system setup, and package-related)
- Rationale for exclusion
- Coverage statistics exclude these endpoints from calculations

Ignored groups now showing 100% coverage:
- Dictionary (2 import/export endpoints ignored)
- DocumentType (3 import/export endpoints ignored)
- MediaType (3 import/export endpoints ignored)
- Import (1 analysis endpoint ignored)
- Install (3 system setup endpoints ignored)
- Package (9 package management endpoints ignored)
- PublishedCache (3 system performance endpoints ignored)
- Security (4 security-sensitive endpoints ignored)
- Telemetry (3 privacy-sensitive endpoints ignored)
- Upgrade (2 system setup endpoints ignored)
- User Group (3 permission escalation endpoints ignored)
- User (22 security-sensitive endpoints ignored)
