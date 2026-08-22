---
root: false
targets:
  - '*'
description: ''
globs:
  - '**/*'
cursorRuleType: always
---

# Model Context Providers Development Guide

General MCP concepts, tool-building patterns, and TypeScript conventions are covered
by the base `umbraco-mcp-skills` plugin (`mcp-patterns`, `build-tools` skills). This
file only documents the parts specific to this project.

## Umbraco API Integration

- **Reference `wtf.md`** for documented API quirks, known issues, and limitations
- The Umbraco API exposes the management API for Umbraco
    - It contains Gets, Posts, Puts, Deletes for interacting with Umbraco
    - It contains groups of endpoints including Culture, Data Type, Dictionary, Document Blueprint, Document Type, Document Version, Document, Dynamic Root, Health Check, Help, Imaging, Import Indexer, Install, Language, Log Viewer, Manifest, Media Type, Media, Member Group, Member Type, Member, Models Builder, Object Types, oEmbed, Package, Partial View, Preview, Profiling, Property Type, Published Cache, Redirect Management, Relation Type, Scripts, Search, Security, Segment, Server, Static File, Stylesheet, Segment, Telemetry, Template, Temporary File, Upgrade, User Data, User Group, User, Webhook
- The Umbraco API client and models are generated using Orval.
- The Umbraco API is in the /src/api/umbraco
- Zod schemas have been generated for all data, params, requests and responses.
- Zod schemas should always be used to validate any params into provider files
- When placing tools or resources in folders use the rest verb to group the files e.g put actions in the put folder
- When placing tools in folders also group by common types, so folder actions and item action gets groups together. Also group items by rest verb as above within sub folders.

## MCP Resources / ResourceTemplates

This pattern is not covered by the base plugin's skills, and is kept here as the
reference for it. In MCP, resources are readonly endpoints for LLMs to query and
provide context. They should be used for Get requests.

- There are 2 types of resource calls: static resources and dynamic resources
  (`ResourceTemplate`). Dynamic resources can be filtered and changed using params;
  static resources always return the same data.

### Static (read) resources

- they always have a url that starts with `umbraco://` and breaks down the logical path for the endpoint e.g `getItemLanguageDefault` is `umbraco://item/language/default`
- they always use a name that represents the umbraco endpoint
- they always use a description that represents the endpoint
- they always use a try/catch to catch response errors

### Resource templates

- they always use a name that represents the umbraco endpoint
- they always use a description that represents the endpoint
- they always have a url that starts with `umbraco://` and breaks down the logical path for the endpoint e.g `getItemLanguageDefault` is `umbraco://item/language/default`
- the url always contains query strings for the params that are taken from the zod schema definition i.e params of `skip`, `take` and `foldersOnly` become `?skip={skip}&take={take}&foldersOnly={foldersOnly}`
- valid options for the params are shown in the `complete` property on the `ResourceTemplate` definition. They always match the param type (e.g. `true`/`false` for a boolean), but the value passed through `complete` is always a string, e.g:
    ```typescript
    new ResourceTemplate("umbraco://data-type/root?skip={skip}&take={take}&foldersOnly={foldersOnly}", {
        list: undefined,
        complete: {
          skip: (value: string) => ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100"],
          take: (value: string) => ["10", "20", "50", "100"],
          foldersOnly: (value: string) => ["true", "false"]
        }
    }),
    ```
- they always use the zod schema to parse the raw passed variables
- they always use a try/catch to catch response errors

Note: no resources are currently implemented in `src/` — this section documents the
URI-scheme/static-vs-dynamic/`complete`-options pattern for when they are added, not
a currently-live helper API.
