# API Endpoints Analysis

**Last Updated**: 2025-12-03

## Summary

| Collection | Tool Count |
|------------|------------|
| .claude | 0 |
| culture | 1 |
| data-type | 22 |
| dictionary | 10 |
| document | 45 |
| document-blueprint | 16 |
| document-type | 27 |
| document-version | 4 |
| health | 4 |
| imaging | 1 |
| indexer | 3 |
| language | 7 |
| log-viewer | 9 |
| manifest | 3 |
| media | 31 |
| media-type | 23 |
| member | 13 |
| member-group | 7 |
| member-type | 13 |
| models-builder | 3 |
| partial-view | 15 |
| property-type | 1 |
| redirect | 5 |
| relation | 1 |
| relation-type | 2 |
| script | 13 |
| searcher | 2 |
| server | 5 |
| static-file | 4 |
| stylesheet | 13 |
| tag | 1 |
| template | 13 |
| temporary-file | 4 |
| user | 15 |
| user-data | 5 |
| user-group | 8 |
| webhook | 9 |

**Total MCP Tools**: 358

## Tools by Collection

### culture (1)

- `get-culture`

### data-type (22)

- `copy-data-type`
- `create-data-type`
- `create-data-type-folder`
- `delete-data-type`
- `delete-data-type-folder`
- `find-data-type`
- `get-all-data-types`
- `get-data-type`
- `get-data-type-ancestors`
- `get-data-type-children`
- `get-data-type-configuration`
- `get-data-type-folder`
- `get-data-type-property-editor-template`
- `get-data-type-root`
- `get-data-type-search`
- `get-data-type-siblings`
- `get-data-types-by-id-array`
- `get-references-data-type`
- `is-used-data-type`
- `move-data-type`
- `update-data-type`
- `update-data-type-folder`

### dictionary (10)

- `create-dictionary`
- `delete-dictionary-item`
- `find-dictionary`
- `get-dictionary`
- `get-dictionary-ancestors`
- `get-dictionary-by-id-array`
- `get-dictionary-children`
- `get-dictionary-root`
- `move-dictionary-item`
- `update-dictionary-item`

### document (45)

- `copy-document`
- `create-document`
- `delete-document`
- `delete-document-public-access`
- `delete-document-recycle-bin-item`
- `delete-from-recycle-bin`
- `empty-recycle-bin`
- `get-collection-document-by-id`
- `get-document-ancestors`
- `get-document-are-referenced`
- `get-document-audit-log`
- `get-document-available-segment-options`
- `get-document-by-id`
- `get-document-by-id-referenced-by`
- `get-document-by-id-referenced-descendants`
- `get-document-children`
- `get-document-configuration`
- `get-document-domains`
- `get-document-notifications`
- `get-document-property-value-template`
- `get-document-public-access`
- `get-document-publish`
- `get-document-recycle-bin-siblings`
- `get-document-root`
- `get-document-siblings`
- `get-document-urls`
- `get-item-document`
- `get-recycle-bin-document-children`
- `get-recycle-bin-document-original-parent`
- `get-recycle-bin-document-referenced-by`
- `get-recycle-bin-document-root`
- `move-document`
- `move-document-to-recycle-bin`
- `post-document-public-access`
- `publish-document`
- `publish-document-with-descendants`
- `put-document-domains`
- `put-document-notifications`
- `put-document-public-access`
- `restore-document-from-recycle-bin`
- `search-document`
- `sort-document`
- `unpublish-document`
- `update-document`
- `validate-document`

### document-blueprint (16)

- `create-document-blueprint`
- `create-document-blueprint-folder`
- `create-document-blueprint-from-document`
- `delete-document-blueprint`
- `delete-document-blueprint-folder`
- `get-document-blueprint`
- `get-document-blueprint-ancestors`
- `get-document-blueprint-by-id-array`
- `get-document-blueprint-children`
- `get-document-blueprint-folder`
- `get-document-blueprint-root`
- `get-document-blueprint-scaffold`
- `get-document-blueprint-siblings`
- `move-document-blueprint`
- `update-document-blueprint`
- `update-document-blueprint-folder`

### document-type (27)

- `copy-document-type`
- `create-document-type`
- `create-document-type-folder`
- `create-element-type`
- `delete-document-type`
- `delete-document-type-folder`
- `get-all-document-types`
- `get-document-type-allowed-at-root`
- `get-document-type-allowed-children`
- `get-document-type-ancestors`
- `get-document-type-available-compositions`
- `get-document-type-blueprint`
- `get-document-type-by-id`
- `get-document-type-children`
- `get-document-type-composition-references`
- `get-document-type-configuration`
- `get-document-type-folder`
- `get-document-type-root`
- `get-document-type-siblings`
- `get-document-types-by-id-array`
- `get-icons`
- `move-document-type`
- `search-document-type`
- `update-document-type`
- `update-document-type-folder`
- `validate-document-type`
- `validate-document-type-post`

### document-version (4)

- `create-document-version-rollback`
- `get-document-version`
- `get-document-version-by-id`
- `update-document-version-prevent-cleanup`

### health (4)

- `execute-health-check-action`
- `get-health-check-group-by-name`
- `get-health-check-groups`
- `run-health-check-group`

### imaging (1)

- `get-imaging-resize-urls`

### indexer (3)

- `get-indexer`
- `get-indexer-by-index-name`
- `post-indexer-by-index-name-rebuild`

### language (7)

- `create-language`
- `delete-language`
- `get-default-language`
- `get-language`
- `get-language-by-iso-code`
- `get-language-items`
- `update-language`

### log-viewer (9)

- `delete-log-viewer-saved-search-by-name`
- `get-log-viewer-level`
- `get-log-viewer-level-count`
- `get-log-viewer-log`
- `get-log-viewer-message-template`
- `get-log-viewer-saved-search`
- `get-log-viewer-saved-search-by-name`
- `get-log-viewer-validate-logs-size`
- `post-log-viewer-saved-search`

### manifest (3)

- `get-manifest-manifest`
- `get-manifest-manifest-private`
- `get-manifest-manifest-public`

### media (31)

- `create-media`
- `create-media-multiple`
- `delete-media`
- `delete-media-from-recycle-bin`
- `delete-media-recycle-bin-item`
- `empty-media-recycle-bin`
- `get-collection-media`
- `get-media-ancestors`
- `get-media-are-referenced`
- `get-media-audit-log`
- `get-media-by-id`
- `get-media-by-id-array`
- `get-media-by-id-referenced-by`
- `get-media-by-id-referenced-descendants`
- `get-media-children`
- `get-media-configuration`
- `get-media-recycle-bin-siblings`
- `get-media-root`
- `get-media-siblings`
- `get-media-urls`
- `get-recycle-bin-media-children`
- `get-recycle-bin-media-original-parent`
- `get-recycle-bin-media-referenced-by`
- `get-recycle-bin-media-root`
- `move-media`
- `move-media-to-recycle-bin`
- `restore-media-from-recycle-bin`
- `sort-media`
- `update-media`
- `validate-media`
- `validate-media-update`

### media-type (23)

- `copy-media-type`
- `create-media-type`
- `create-media-type-folder`
- `delete-media-type`
- `delete-media-type-folder`
- `get-allowed-media-type`
- `get-item-media-type`
- `get-media-type-allowed-at-root`
- `get-media-type-allowed-children`
- `get-media-type-ancestors`
- `get-media-type-available-compositions`
- `get-media-type-by-id`
- `get-media-type-by-ids`
- `get-media-type-children`
- `get-media-type-composition-references`
- `get-media-type-configuration`
- `get-media-type-folder`
- `get-media-type-folders`
- `get-media-type-root`
- `get-media-type-siblings`
- `move-media-type`
- `update-media-type`
- `update-media-type-folder`

### member (13)

- `create-member`
- `delete-member`
- `find-member`
- `get-item-member-search`
- `get-member`
- `get-member-are-referenced`
- `get-member-by-id-referenced-by`
- `get-member-by-id-referenced-descendants`
- `get-member-configuration`
- `get-members-by-id-array`
- `update-member`
- `validate-member`
- `validate-member-update`

### member-group (7)

- `create-member-group`
- `delete-member-group`
- `get-all-member-groups`
- `get-member-group`
- `get-member-group-by-id-array`
- `get-member-group-root`
- `update-member-group`

### member-type (13)

- `copy-member-type`
- `create-member-type`
- `delete-member-type`
- `get-member-type`
- `get-member-type-available-compositions`
- `get-member-type-by-id`
- `get-member-type-composition-references`
- `get-member-type-configuration`
- `get-member-type-root`
- `get-member-type-siblings`
- `get-member-types-by-id-array`
- `search-member-type-items`
- `update-member-type`

### models-builder (3)

- `get-models-builder-dashboard`
- `get-models-builder-status`
- `post-models-builder-build`

### partial-view (15)

- `create-partial-view`
- `create-partial-view-folder`
- `delete-partial-view`
- `delete-partial-view-folder`
- `get-partial-view-ancestors`
- `get-partial-view-by-path`
- `get-partial-view-children`
- `get-partial-view-folder-by-path`
- `get-partial-view-root`
- `get-partial-view-search`
- `get-partial-view-siblings`
- `get-partial-view-snippet`
- `get-partial-view-snippet-by-id`
- `rename-partial-view`
- `update-partial-view`

### property-type (1)

- `get-property-type-is-used`

### redirect (5)

- `delete-redirect`
- `get-all-redirects`
- `get-redirect-by-id`
- `get-redirect-status`
- `update-redirect-status`

### relation (1)

- `get-relation-by-relation-type-id`

### relation-type (2)

- `get-relation-type`
- `get-relation-type-by-id`

### script (13)

- `create-script`
- `create-script-folder`
- `delete-script`
- `delete-script-folder`
- `get-script-by-path`
- `get-script-folder-by-path`
- `get-script-items`
- `get-script-tree-ancestors`
- `get-script-tree-children`
- `get-script-tree-root`
- `get-script-tree-siblings`
- `rename-script`
- `update-script`

### searcher (2)

- `get-searcher`
- `get-searcher-by-searcher-name-query`

### server (5)

- `get-server-configuration`
- `get-server-information`
- `get-server-status`
- `get-server-troubleshooting`
- `get-server-upgrade-check`

### static-file (4)

- `get-static-file-ancestors`
- `get-static-file-children`
- `get-static-file-root`
- `get-static-files`

### stylesheet (13)

- `create-stylesheet`
- `create-stylesheet-folder`
- `delete-stylesheet`
- `delete-stylesheet-folder`
- `get-stylesheet-ancestors`
- `get-stylesheet-by-path`
- `get-stylesheet-children`
- `get-stylesheet-folder-by-path`
- `get-stylesheet-root`
- `get-stylesheet-search`
- `get-stylesheet-siblings`
- `rename-stylesheet`
- `update-stylesheet`

### tag (1)

- `get-tags`

### template (13)

- `create-template`
- `delete-template`
- `execute-template-query`
- `get-template`
- `get-template-ancestors`
- `get-template-children`
- `get-template-configuration`
- `get-template-query-settings`
- `get-template-root`
- `get-template-search`
- `get-template-siblings`
- `get-templates-by-id-array`
- `update-template`

### temporary-file (4)

- `create-temporary-file`
- `delete-temporary-file`
- `get-temporary-file`
- `get-temporary-file-configuration`

### user (15)

- `delete-user-avatar-by-id`
- `find-user`
- `get-item-user`
- `get-user`
- `get-user-by-id`
- `get-user-by-id-calculate-start-nodes`
- `get-user-configuration`
- `get-user-current`
- `get-user-current-configuration`
- `get-user-current-login-providers`
- `get-user-current-permissions`
- `get-user-current-permissions-document`
- `get-user-current-permissions-media`
- `upload-user-avatar-by-id`
- `upload-user-current-avatar`

### user-data (5)

- `create-user-data`
- `delete-user-data`
- `get-user-data`
- `get-user-data-by-id`
- `update-user-data`

### user-group (8)

- `create-user-group`
- `delete-user-group`
- `delete-user-groups`
- `get-filter-user-group`
- `get-user-group`
- `get-user-group-by-id-array`
- `get-user-groups`
- `update-user-group`

### webhook (9)

- `create-webhook`
- `delete-webhook`
- `get-all-webhook-logs`
- `get-webhook`
- `get-webhook-by-id`
- `get-webhook-events`
- `get-webhook-item`
- `get-webhook-logs`
- `update-webhook`

## Notes

- This count includes only files that contain `CreateUmbracoTool` or `CreateUmbracoResource`
- Excludes `index.ts` files and test files (`__tests__` directories)
- Helper files, constants, and utilities are not counted