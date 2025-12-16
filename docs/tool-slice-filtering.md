# Tool Slice Filtering

Tool slices provide fine-grained control over which tools are registered based on their **operation type**. Slices work alongside mode and collection filtering to enable precise tool selection.

## Overview

Slices segment tools by what they do:
- **CRUD operations**: create, read, update, delete
- **Navigation**: tree traversal (root, children, ancestors, siblings)
- **Queries**: search, list, references
- **Workflows**: publish, recycle-bin, move, copy, sort, validate, rename
- **Information**: configuration, audit, urls, permissions
- **Entity management**: notifications, public-access, scaffolding, blueprints
- **System**: server-info, diagnostics, templates

## Configuration

### Environment Variables
```bash
UMBRACO_INCLUDE_SLICES=create,read,tree
UMBRACO_EXCLUDE_SLICES=delete,recycle-bin
```

### CLI Arguments
```bash
--umbraco-include-slices=create,read,tree
--umbraco-exclude-slices=delete,recycle-bin
```

## Filtering Logic

The filtering chain applies in this order:
1. **Modes** expand to collections
2. **Collections** filter which tool collections load
3. **Slices** filter which tools within those collections register
4. **Tool-level** include/exclude applies last

When `includeSlices` is set, only tools matching those slices register. When `excludeSlices` is set, matching tools are excluded regardless of other settings.

## Available Slices (28 total)

### Core CRUD (4 slices)

| Slice | Pattern | Description |
|-------|---------|-------------|
| `create` | `create-*` | Create entities including folders |
| `read` | `get-*-by-id`, `get-*-by-id-array`, `get-*-by-path`, `get-*-by-iso-code` | Get single/batch by ID |
| `update` | `update-*` | Update entities including folders |
| `delete` | `delete-*` (excl. recycle-bin) | Delete entities including folders |

### Tree Navigation (1 slice)

| Slice | Pattern | Description |
|-------|---------|-------------|
| `tree` | `get-*-root`, `get-*-children`, `get-*-ancestors`, `get-*-siblings` | All tree navigation |

### Query Slices (3 slices)

| Slice | Pattern | Description |
|-------|---------|-------------|
| `search` | `search-*`, `find-*` | Search/filter operations |
| `list` | `get-all-*`, `get-collection-*` | List all items |
| `references` | `*-referenced-*`, `*-references`, `*-composition-*` | Reference/dependency queries |

### Workflow Slices (7 slices)

| Slice | Pattern | Description |
|-------|---------|-------------|
| `publish` | `publish-*`, `unpublish-*` | Publishing operations |
| `recycle-bin` | `*-recycle-bin*` | Recycle bin operations |
| `move` | `move-*` (excl. recycle-bin) | Move operations |
| `copy` | `copy-*` | Copy operations |
| `sort` | `sort-*` | Sort/reorder operations |
| `validate` | `validate-*` | Validation operations |
| `rename` | `rename-*` | Rename file-based entities |

### Information Slices (6 slices)

| Slice | Pattern | Description |
|-------|---------|-------------|
| `configuration` | `*-configuration` | Configuration retrieval |
| `audit` | `*-audit-log` | Audit trail access |
| `urls` | `*-urls`, `*-domains` | URL and domain management |
| `permissions` | `*-permissions*` | User permission queries |
| `user-status` | `enable-user`, `disable-user`, `unlock-user`, `*-avatar*` | User account operations |
| `current-user` | `get-user-current*` | Current user context |

### Entity Management Slices (4 slices)

| Slice | Pattern | Description |
|-------|---------|-------------|
| `notifications` | `*-notifications` | Content notification settings |
| `public-access` | `*-public-access*` | Content protection rules |
| `scaffolding` | `*-scaffold*`, `*-allowed-*`, `*-available-*` | Content creation helpers |
| `blueprints` | `*-blueprint*` (non-CRUD) | Blueprint specialized operations |

### System Slices (3 slices)

| Slice | Pattern | Description |
|-------|---------|-------------|
| `server-info` | `get-server-*` | Server status/info |
| `diagnostics` | Health checks, log viewer, indexer ops | System diagnostics |
| `templates` | `*-template*` (non-CRUD), `*-snippet*` | Template/snippet helpers |

### Catch-all (1 slice)

| Slice | Pattern | Description |
|-------|---------|-------------|
| `other` | No pattern match | Remaining specialized tools |

## Usage Examples

### Read-only content browsing
```bash
UMBRACO_TOOL_MODES=content
UMBRACO_INCLUDE_SLICES=read,tree,search
```

### Full CRUD without destructive operations
```bash
UMBRACO_EXCLUDE_SLICES=delete,recycle-bin
```

### Content editors (no system tools)
```bash
UMBRACO_INCLUDE_SLICES=create,read,update,tree,search,publish
```

### Admin operations only
```bash
UMBRACO_INCLUDE_SLICES=configuration,audit,user-status,diagnostics
```

## Tool-to-Slice Mapping

### Slice Counts Summary

| Slice | Count | Category |
|-------|-------|----------|
| create | 27 | CRUD |
| read | 25 | CRUD |
| update | 23 | CRUD |
| delete | 28 | CRUD |
| tree | 42 | Navigation |
| search | 6 | Query |
| list | 7 | Query |
| references | 15 | Query |
| publish | 4 | Workflow |
| recycle-bin | 12 | Workflow |
| move | 7 | Workflow |
| copy | 5 | Workflow |
| sort | 2 | Workflow |
| validate | 5 | Workflow |
| rename | 3 | Workflow |
| configuration | 12 | Information |
| audit | 2 | Information |
| urls | 5 | Information |
| permissions | 3 | Information |
| user-status | 5 | Information |
| current-user | 4 | Information |
| notifications | 2 | Entity Mgmt |
| public-access | 4 | Entity Mgmt |
| scaffolding | 11 | Entity Mgmt |
| blueprints | 3 | Entity Mgmt |
| server-info | 4 | System |
| diagnostics | 14 | System |
| templates | 8 | System |
| other | ~16 | Catch-all |

### Detailed Tool Lists

#### `create` (27 tools)
```
create-culture, create-data-type, create-data-type-folder, create-dictionary-item,
create-document, create-document-blueprint, create-document-blueprint-from-document,
create-document-type, create-document-type-folder, create-document-version-rollback,
create-element-type, create-language, create-log-viewer-saved-search, create-media,
create-media-type, create-media-type-folder, create-member, create-member-group,
create-member-type, create-partial-view, create-relation, create-relation-type,
create-script, create-stylesheet, create-template, create-temporary-file,
create-user, create-user-group, create-webhook
```

#### `read` (25 tools)
```
get-culture-by-iso-code, get-data-type-by-id, get-data-type-folder,
get-dictionary-item-by-id, get-document-by-id, get-document-blueprint-by-id,
get-document-type-by-id, get-document-type-folder, get-document-version-by-id,
get-health-check-group-by-name, get-indexer-by-index-name, get-language-by-iso-code,
get-media-by-id, get-media-type-by-id, get-media-type-folder, get-member-by-id,
get-member-group-by-id, get-member-type-by-id, get-partial-view-by-path,
get-redirect-by-id, get-relation-by-id, get-relation-type-by-id, get-script-by-path,
get-stylesheet-by-path, get-template-by-id, get-user-by-id, get-user-group-by-id,
get-webhook-by-id
```

#### `update` (23 tools)
```
update-culture, update-data-type, update-data-type-folder, update-dictionary-item,
update-document, update-document-blueprint, update-document-properties,
update-document-type, update-document-type-folder, update-language, update-media,
update-media-type, update-media-type-folder, update-member, update-member-group,
update-member-type, update-partial-view, update-relation, update-relation-type,
update-script, update-stylesheet, update-template, update-user, update-user-group,
update-webhook, update-block-property
```

#### `delete` (28 tools)
```
delete-culture, delete-data-type, delete-data-type-folder, delete-dictionary-item,
delete-document, delete-document-blueprint, delete-document-public-access,
delete-document-type, delete-document-type-folder, delete-language,
delete-log-viewer-saved-search, delete-media, delete-media-type, delete-media-type-folder,
delete-member, delete-member-group, delete-member-type, delete-partial-view,
delete-redirect, delete-relation, delete-relation-type, delete-script, delete-stylesheet,
delete-template, delete-temporary-file, delete-user, delete-user-avatar, delete-user-group,
delete-webhook
```

#### `tree` (42 tools)
```
get-document-root, get-document-children, get-document-ancestors, get-document-siblings,
get-media-root, get-media-children, get-media-ancestors, get-media-siblings,
get-data-type-root, get-data-type-children, get-data-type-ancestors,
get-document-type-root, get-document-type-children, get-document-type-ancestors,
get-media-type-root, get-media-type-children, get-media-type-ancestors,
get-member-type-root, get-member-type-children, get-member-type-ancestors,
get-partial-view-root, get-partial-view-children, get-partial-view-ancestors,
get-script-root, get-script-children, get-script-ancestors,
get-stylesheet-root, get-stylesheet-children, get-stylesheet-ancestors,
get-static-file-root, get-static-file-children, get-static-file-ancestors,
get-document-blueprint-root, get-document-blueprint-children, get-document-blueprint-ancestors,
get-dictionary-root, get-dictionary-children, get-dictionary-ancestors,
+ similar for other hierarchical entities
```

#### `search` (6 tools)
```
search-document, search-media, find-data-type, find-dictionary-item,
find-member, find-template
```

#### `list` (7 tools)
```
get-all-cultures, get-all-languages, get-all-member-groups, get-all-redirects,
get-all-relation-types, get-collection-document, get-collection-media
```

#### `references` (15 tools)
```
get-document-are-referenced, get-document-by-id-referenced-by,
get-document-by-id-referenced-descendants, get-media-are-referenced,
get-media-by-id-referenced-by, get-media-by-id-referenced-descendants,
get-data-type-references, get-document-type-composition-references,
get-media-type-composition-references, get-member-type-composition-references,
get-recycle-bin-document-referenced-by, get-recycle-bin-media-referenced-by
```

#### `publish` (4 tools)
```
publish-document, publish-document-with-descendants, unpublish-document,
get-document-publish
```

#### `recycle-bin` (12 tools)
```
move-document-to-recycle-bin, move-media-to-recycle-bin,
restore-document-from-recycle-bin, restore-media-from-recycle-bin,
empty-document-recycle-bin, empty-media-recycle-bin,
delete-document-from-recycle-bin, delete-media-from-recycle-bin,
get-document-recycle-bin-root, get-media-recycle-bin-root,
get-document-recycle-bin-children, get-media-recycle-bin-children
```

#### `move` (7 tools)
```
move-document, move-media, move-data-type, move-document-type,
move-media-type, move-document-blueprint, move-member-type
```

#### `copy` (5 tools)
```
copy-document, copy-media, copy-data-type, copy-document-type, copy-media-type
```

#### `sort` (2 tools)
```
sort-document, sort-media
```

#### `validate` (5 tools)
```
validate-document, validate-media, validate-document-type,
validate-media-type, validate-member
```

#### `rename` (3 tools)
```
rename-partial-view, rename-script, rename-stylesheet
```

#### `configuration` (12 tools)
```
get-data-type-configuration, get-document-configuration,
get-document-type-configuration, get-media-configuration,
get-media-type-configuration, get-member-configuration,
get-member-type-configuration, get-server-configuration,
get-temporary-file-configuration, get-user-configuration,
get-imaging-configuration, get-indexer-configuration
```

#### `audit` (2 tools)
```
get-document-audit-log, get-media-audit-log
```

#### `urls` (5 tools)
```
get-document-urls, get-media-urls, get-imaging-resize-urls,
get-document-domains, put-document-domains
```

#### `permissions` (3 tools)
```
get-user-current-permissions, get-user-current-permissions-document,
get-user-current-permissions-media
```

#### `user-status` (5 tools)
```
enable-user, disable-user, unlock-user, upload-user-avatar-by-id,
delete-user-avatar-by-id
```

#### `current-user` (4 tools)
```
get-user-current, get-user-current-configuration,
get-user-current-login-providers, get-user-current-2fa
```

#### `notifications` (2 tools)
```
get-document-notifications, put-document-notifications
```

#### `public-access` (4 tools)
```
get-document-public-access, post-document-public-access,
put-document-public-access, delete-document-public-access
```

#### `scaffolding` (11 tools)
```
get-document-blueprint-scaffold, get-document-available-segment-options,
get-document-type-allowed-at-root, get-document-type-allowed-children,
get-document-type-available-compositions, get-media-type-allowed-at-root,
get-media-type-allowed-children, get-media-type-available-compositions,
get-member-type-available-compositions
```

#### `blueprints` (3 tools)
```
create-document-blueprint-from-document, get-document-blueprint-scaffold,
get-document-type-blueprint
```

#### `server-info` (4 tools)
```
get-server-information, get-server-status, get-server-troubleshooting,
get-server-upgrade-check
```

#### `diagnostics` (14 tools)
```
get-health-check-groups, get-health-check-group-by-name, run-health-check-group,
execute-health-check-action, get-log-viewer-log, get-log-viewer-level,
get-log-viewer-level-count, get-log-viewer-message-template,
get-log-viewer-saved-search, get-log-viewer-validate-logs-size,
get-indexer, post-indexer-rebuild, get-models-builder-dashboard,
get-models-builder-status, post-models-builder-build
```

#### `templates` (8 tools)
```
execute-template-query, get-template-query-settings,
get-data-type-property-editor-template, get-document-property-value-template,
get-partial-view-snippet, get-partial-view-snippet-by-id
```

#### `other` (~16 tools)
Remaining specialized operations:
```
get-webhook-events, get-webhook-logs, get-all-webhook-logs, get-tags,
get-manifest, get-redirect-status, update-redirect-status,
get-default-language, get-icons
```

## Design Decisions

1. **Tree slices**: Single `tree` compound slice (not individual tree-root, tree-children, etc.)
2. **CRUD slices**: Individual `create`, `read`, `update`, `delete` slices (no compound `crud`)
3. **Folder operations**: Included within CRUD slices (create-folder → `create`, get-folder → `read`, etc.)
4. **Unmatched tools**: Assigned to `other` slice - must explicitly include `other` to get unmatched tools
