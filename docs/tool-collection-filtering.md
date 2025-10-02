# Tool Collection Filtering Architecture

## Overview

The Umbraco MCP Server implements a flexible tool and collection filtering system that allows fine-grained control over which MCP tools are available to AI assistants. This system operates at two levels:

- **Collection-level filtering**: Enable/disable entire groups of related tools
- **Tool-level filtering**: Include/exclude specific individual tools

## Environment Variables

The system uses consistent `UMBRACO_*` naming for all environment variables:

### Required Variables
- `UMBRACO_CLIENT_ID` - API user credentials
- `UMBRACO_CLIENT_SECRET` - API user secret
- `UMBRACO_BASE_URL` - Umbraco instance URL

### Tool Filtering Variables
- `UMBRACO_INCLUDE_TOOLS` - Comma-separated list of specific tools to include
- `UMBRACO_EXCLUDE_TOOLS` - Comma-separated list of specific tools to exclude

### Collection Filtering Variables
- `UMBRACO_INCLUDE_TOOL_COLLECTIONS` - Comma-separated list of collections to include
- `UMBRACO_EXCLUDE_TOOL_COLLECTIONS` - Comma-separated list of collections to exclude

## Collection Structure

Tools are organized into logical collections based on functionality:

```
src/umb-management-api/tools/
├── culture/              # Culture & localization management
├── data-type/            # Data type definitions and management
├── dictionary/           # Dictionary item management
├── document/             # Document content operations
├── document-blueprint/   # Document blueprint templates
├── document-type/        # Document type definitions
├── document-version/     # Document version management
├── language/             # Language settings
├── log-viewer/           # System logs and diagnostics
├── media/                # Media asset management
├── media-type/           # Media type definitions
├── member/               # Member account management
├── member-group/         # Member group operations
├── member-type/          # Member type definitions
├── partial-view/         # Partial view templates
├── property-type/        # Property type management
├── redirect/             # URL redirect management
├── script/               # Script file management
├── server/               # Server information
├── stylesheet/           # CSS stylesheet management
├── template/             # Template management
├── temporary-file/       # Temporary file operations
├── user-group/           # User group management
└── webhook/              # Webhook integrations
```

## Architecture Components

### Tool Collection Interface

Each collection exports metadata and tools:

```typescript
export interface ToolCollectionMetadata {
  name: string;           // Collection key (e.g., 'culture', 'data-type')
  displayName: string;    // Human readable name
  description: string;    // Collection description
  dependencies?: string[]; // Required collections
}

export interface ToolCollectionExport {
  metadata: ToolCollectionMetadata;
  tools: (user: CurrentUserResponseModel) => ToolDefinition<any>[];
}
```

### Collection Dependencies

Some collections have dependencies that are automatically resolved:

- `dictionary` → requires `language`
- `document-blueprint` → requires `document-type`, `document`
- `media` → requires `temporary-file`
- `member-group` → requires `member`, `member-type`
- `member-type` → requires `member`, `member-group`
- `temporary-file` → requires `media`

### Configuration Loading

Configuration is loaded from the server config object:

```typescript
export class CollectionConfigLoader {
  static loadFromConfig(config: UmbracoServerConfig): CollectionConfiguration {
    return {
      enabledCollections: config.includeToolCollections ?? DEFAULT_COLLECTION_CONFIG.enabledCollections,
      disabledCollections: config.excludeToolCollections ?? DEFAULT_COLLECTION_CONFIG.disabledCollections,
      enabledTools: config.includeTools ?? DEFAULT_COLLECTION_CONFIG.enabledTools,
      disabledTools: config.excludeTools ?? DEFAULT_COLLECTION_CONFIG.disabledTools,
    };
  }
}
```

### Tool Factory Integration

The `UmbracoToolFactory` processes configuration and loads tools:

1. Load configuration from server config
2. Validate collection names and dependencies
3. Resolve collection dependencies automatically
4. Filter collections based on configuration
5. Load tools from enabled collections
6. Apply tool-level filtering
7. Register tools with MCP server

## Usage Examples

### Content Editor Setup
Focus on content management tools only:
```bash
export UMBRACO_INCLUDE_TOOL_COLLECTIONS="document,document-type,media,template"
```

### Developer Setup
Include development-focused tools:
```bash
export UMBRACO_INCLUDE_TOOL_COLLECTIONS="data-type,document-type,property-type,script,template"
```

### Safety Restrictions
Exclude potentially dangerous operations:
```bash
export UMBRACO_EXCLUDE_TOOL_COLLECTIONS="log-viewer,temporary-file"
export UMBRACO_EXCLUDE_TOOLS="delete-document,empty-recycle-bin"
```

### Granular Control
Combine collection and tool-level filtering:
```bash
export UMBRACO_INCLUDE_TOOL_COLLECTIONS="document,media"
export UMBRACO_EXCLUDE_TOOLS="delete-document,delete-media"
```

## Filtering Logic

The filtering system follows this precedence:

1. **Collection filtering** - Determines which collections are available
2. **Dependency resolution** - Automatically includes required collections
3. **User permissions** - Tools are filtered by Umbraco user permissions
4. **Tool-level filtering** - Individual tools can be included/excluded

### Default Behavior
- If no filtering is specified, all collections and tools are loaded
- Collection dependencies are always resolved automatically
- User permissions are always enforced

### Include vs Exclude Mode
- **Include mode**: Only specified collections/tools are loaded
- **Exclude mode**: All collections/tools are loaded except those specified
- Tool-level include/exclude can override collection-level decisions

## Implementation Details

### Environment Variable Parsing

All environment variables support:
- Comma-separated values with automatic trimming
- Empty string handling
- Whitespace tolerance

Example:
```bash
# These are equivalent:
export UMBRACO_INCLUDE_TOOL_COLLECTIONS="culture,data-type,document"
export UMBRACO_INCLUDE_TOOL_COLLECTIONS="culture, data-type , document"
export UMBRACO_INCLUDE_TOOL_COLLECTIONS=" culture , data-type , document "
```

### Validation

The system includes comprehensive validation:
- **Collection name validation** - Warns about invalid collection names
- **Dependency validation** - Ensures required collections are included
- **Conflict detection** - Identifies configuration conflicts

### Error Handling

- Invalid collection names generate console warnings but don't break execution
- Missing dependencies are automatically resolved
- Configuration errors are logged but fall back to safe defaults

## Testing

The system includes comprehensive test coverage:

- **Unit tests** for configuration parsing and validation
- **Integration tests** for the complete filtering pipeline
- **Environment variable tests** for edge cases
- **Collection structure validation** tests

Key test scenarios:
- Default behavior (no filtering)
- Include/exclude modes
- Dependency resolution
- Invalid configuration handling
- Tool-level overrides

## Benefits

1. **Flexible Configuration** - Fine-grained control over available tools
2. **Automatic Dependencies** - No need to manually track collection relationships
3. **Type Safety** - Full TypeScript support with compile-time validation
4. **Performance** - Reduced tool loading and smaller context windows
5. **User Safety** - Ability to restrict dangerous operations
6. **Backwards Compatibility** - Default behavior loads all tools

## Migration from Legacy Variables

The system has migrated from inconsistent naming to a unified `UMBRACO_*` pattern:

### Old Variables (deprecated)
- `INCLUDE_MANAGEMENT_TOOLS` → `UMBRACO_INCLUDE_TOOLS`
- `EXCLUDE_MANAGEMENT_TOOLS` → `UMBRACO_EXCLUDE_TOOLS`
- `INCLUDE_MANAGEMENT_COLLECTIONS` → `UMBRACO_INCLUDE_TOOL_COLLECTIONS`
- `EXCLUDE_MANAGEMENT_COLLECTIONS` → `UMBRACO_EXCLUDE_TOOL_COLLECTIONS`

All configuration examples and documentation have been updated to use the new naming convention.