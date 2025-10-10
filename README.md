# Umbraco MCP ![GitHub License](https://img.shields.io/github/license/umbraco/Umbraco-CMS-MCP-Dev?style=plastic&link=https%3A%2F%2Fgithub.com%2Fumbraco%2FUmbraco-CMS-MCP-Dev%2Fblob%2Fmain%2FLICENSE)

An MCP (Model Context Protocol) server for [Umbraco CMS](https://umbraco.com/)
it provides developer access to the majority of the Management API enabling you to complete most back office tasks with your agent that you can accomplish using the UI.

## Intro

The MCP server uses an Umbraco API user to access your Umbraco Management API, mean the tools available to the AI can be controlled using normal Umbraco user permissions.

## Getting Started

### Umbraco

In order for the MCP to talk to the Management API you will need to create a API user
if you are unsure how to do this follow [Umbraco's documentation](https://docs.umbraco.com/umbraco-cms/fundamentals/data/users/api-users).

The level of access you provider this user will determine what your agent is able to do.

### Installation

First, create an Umbraco API user with appropriate permissions. You can find instructions in [Umbraco's documentation](https://docs.umbraco.com/umbraco-cms/fundamentals/data/users/api-users).

<details>
<summary>Claude Desktop</summary>

To get started with using the Umbraco MCP with Claude, first download and install the [Claude.ai desktop app](https://claude.ai/download).  

Start up your Umbraco instance (currently working with version **15.latest**) and create new API user credentials. You can see instructions on how to do that on the [Umbraco docs](https://docs.umbraco.com/umbraco-cms/fundamentals/data/users/api-users).

Once you have this information head back into Claude desktop app and head to Settings > Developer > Edit Config. Open the json file in a text editor of your choice and add the below, replacing the `UMBRACO_CLIENT_ID`, `UMBRACO_CLIENT_SECRET` and `UMBRACO_BASE_URL` with your local connection information. The addition of the `NODE_TLS_REJECT_UNAUTHORIZED` env flag is to allow Claude to connect to the MCP using a self-signed cert.


```
{
  "mcpServers": {
    "umbraco-mcp": {
      "command": "npx",
      "args": ["@umbraco-cms/mcp-dev@beta"],
      "env": {
        "NODE_TLS_REJECT_UNAUTHORIZED": "0",
        "UMBRACO_CLIENT_ID": "umbraco-back-office-mcp",
        "UMBRACO_CLIENT_SECRET": "1234567890",
        "UMBRACO_BASE_URL": "https://localhost:44391",
        "UMBRACO_INCLUDE_TOOL_COLLECTIONS": "culture,document,media",
        "UMBRACO_EXCLUDE_TOOLS": "delete-document,empty-recycle-bin"
      }
    }
  }
}
```

Restart Claude and try it out with a simple prompt such as `Tell me the GUID of the home page document type`. You'll need to allow each one of the tools as the Umbraco MCP starts to work its way through. If you receive a connection error with the Umbraco MCP click the button to open the logs and review the file `mcp-server-umbraco-mcp.log` for extra information on how to fix the issue.  

> [!NOTE]
> You may need to update to a paid version of Claude.ai in order to have a large enough context window to run your prompts.

</details>


<details>
<summary>Claude Code</summary>

Use the Claude Code CLI to add the Umbraco MCP server:

```bash
claude mcp add umbraco-mcp npx @umbraco-cms/mcp-dev@beta
```

Or configure environment variables and scope:
```bash
# Install Claude Code globally (if not already installed)
npm install -g @anthropic-ai/claude-code

# Add with environment variables
claude mcp add umbraco-mcp --env UMBRACO_CLIENT_ID="your-id" --env UMBRACO_CLIENT_SECRET="your-secret" --env UMBRACO_BASE_URL="https://your-domain.com" --env NODE_TLS_REJECT_UNAUTHORIZED="0" --env UMBRACO_INCLUDE_TOOL_COLLECTIONS="culture,document,media" -- npx @umbraco-cms/mcp-dev@beta

# Verify installation
claude mcp list
```

This will add umbraco-mcp to the existing project in the claude.json config file.

#### Configuration via .mcp.json (Project-specific)

For project-specific Claude Code configuration, create a `.mcp.json` file in your project root that references environment variables for sensitive data:

```json
{
  "mcpServers": {
    "umbraco-mcp": {
      "command": "npx",
      "args": ["@umbraco-cms/mcp-dev@beta"],
      "env": {
        "NODE_TLS_REJECT_UNAUTHORIZED": "0",
        "UMBRACO_CLIENT_ID": "umbraco-back-office-mcp",
        "UMBRACO_CLIENT_SECRET": "your-client-secret-here",
        "UMBRACO_BASE_URL": "https://localhost:44391",
        "UMBRACO_INCLUDE_TOOL_COLLECTIONS": "culture,document,media",
        "UMBRACO_EXCLUDE_TOOLS": "delete-document,empty-recycle-bin"
      }
    }
  }
}
```

Using the `.mcp.json` file allows you to:
- Configure MCP servers per project
- Share configuration with team members (commit to version control)
- Override global Claude Code MCP settings for specific projects
- Move the environment varaibles to a .env file to prevent leaking of secrets to your code repo

</details>

<details>
<summary>VS Code</summary>

#### Click the button to install:
[<img src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF" alt="Install in VS Code">](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%257B%2522name%2522%253A%2522umbraco-mcp%2522%252C%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522%2540umbraco-mcp%252Fumbraco-mcp-cms%2540alpha%2522%255D%252C%2522env%2522%253A%257B%2522UMBRACO_CLIENT_ID%2522%253A%2522%253CAPI%2520user%2520name%253E%2522%252C%2522UMBRACO_CLIENT_SECRET%2522%253A%2522%253CAPI%2520client%2520secert%253E%2522%252C%2522UMBRACO_BASE_URL%2522%253A%2522https%253A%252F%252F%253Cdomain%253E%2522%252C%2522UMBRACO_EXCLUDE_TOOLS%2522%253A%2522%253Ctoolname%253E%252C%253Ctoolname%253E%2522%257D%257D)

**Requirements:** VS Code 1.101+ with GitHub Copilot Chat extension installed.

Or install manually:
Follow the MCP [install guide](https://code.visualstudio.com/docs/copilot/customization/mcp-servers#_add-an-mcp-server), use this config.

```json
{
  "servers": {
    "umbraco-mcp": {
      "type": "stdio",
      "command": "npx", 
      "args": ["@umbraco-cms/mcp-dev@beta"],
      "env": {
        "UMBRACO_CLIENT_ID": "<API user name>",
        "UMBRACO_CLIENT_SECRET": "<API client secret>",
        "UMBRACO_BASE_URL": "https://<domain>",
        "UMBRACO_INCLUDE_TOOL_COLLECTIONS": "<collection>,<collection>",
        "UMBRACO_EXCLUDE_TOOLS": "<toolname>,<toolname>"
      }
    }
  }
}
```

</details>

<details>
<summary>Cursor</summary>

### Or install manually:
Go to `Cursor Settings` -> `Tools & Integrations` -> `Add new MCP Server`. 

Add the following to the config file and update the env variables.

```json
{
  "mcpServers": {
    "umbraco-mcp": {
      "command": "npx", 
      "args": ["@umbraco-cms/mcp-dev@beta"],
      "env": {
        "UMBRACO_CLIENT_ID": "<API user name>",
        "UMBRACO_CLIENT_SECRET": "<API client secret>",
        "UMBRACO_BASE_URL": "https://<domain>",
        "UMBRACO_INCLUDE_TOOL_COLLECTIONS": "<collection>,<collection>",
        "UMBRACO_EXCLUDE_TOOLS": "<toolname>,<toolname>"
      }
    }
  }
}
```
</details>


#### Authentication Configuration Keys

- `UMBRACO_CLIENT_ID`

Umbraco API User name

- `UMBRACO_CLIENT_SECRET`

Umbraco API User client secert

- `UMBRACO_BASE_URL`

Url of the Umbraco site, it only needs to be the scheme and domain e.g https://<nolink/>example.com

#### Security Configuration Keys

- `UMBRACO_ALLOWED_MEDIA_PATHS` (Optional, Security Feature)

**Required for file path media uploads** - Comma-separated list of absolute directory paths that are allowed for media file uploads via the `filePath` source type.

**Security:** This setting prevents unauthorized file system access by restricting which directories can be read during media uploads.

**Default:** When not configured, all file path uploads are rejected with an error.

**Example:**
```bash
# Allow uploads from specific directories only
UMBRACO_ALLOWED_MEDIA_PATHS="/tmp/uploads,/var/media,/home/user/assets"
```

**Note:** URL and base64 media uploads work without this configuration. Only the `filePath` source type requires this setting.

### Environment Configuration Options

The Umbraco MCP server supports environment configuration via:
1. **Environment variables in MCP client config as above** (Claude Desktop, VS Code, etc.)
2. **Local `.env` file** for development (see `.env.example`)
3. **CLI arguments** when running directly

**Configuration precedence:** CLI arguments > Environment variables > `.env` file

#### Using a `.env` file (Development)

For local development, you can create a `.env` file in the project root:

```bash
# Edit with your values
UMBRACO_CLIENT_ID=your-api-user-id
UMBRACO_CLIENT_SECRET=your-api-secret
UMBRACO_BASE_URL=http://localhost:56472
```

The `.env` file is gitignored to keep your secrets secure.

#### CLI Arguments

You can also pass configuration via CLI arguments:

```bash
npx @umbraco-cms/mcp-dev@beta \
  --umbraco-client-id="your-id" \
  --umbraco-client-secret="your-secret" \
  --umbraco-base-url="http://localhost:56472" \
  --env="/path/to/custom/.env"
```

## API Coverage

This MCP server provides **comprehensive coverage** of the Umbraco Management API. We have achieved **full parity** with all applicable endpoints, implementing tools for every operational endpoint suitable for AI-assisted content management.

### Implementation Status

**✅ Implemented:** 36 tool collections and 337 tools covering operational endpoints including (but not limited to)
- Content management (Documents, Media, Members)
- Configuration (Document Types, Media Types, Data Types)
- System management (Templates, Scripts, Stylesheets)
- User administration (Users, User Groups, Permissions)
- Advanced features (Webhooks, Relations, Health Checks)

### Tool Configuration 

- `UMBRACO_EXCLUDE_TOOLS`

The allows you to specify tools by name if you wish to exclude them for the usable tools list. This is helpful as some Agents, cant handle so many tools. This is a commma seperated list of tools which can be found below.

- `UMBRACO_INCLUDE_TOOLS`

The allows you to specify tools by name if you wish to include only specific tools in the usable tools list. When specified, only these tools will be available. This is a commma seperated list of tools which can be found below.

- `UMBRACO_INCLUDE_TOOL_COLLECTIONS`

The allows you to specify collections by name if you wish to include only specific collections. When specified, only tools from these collections will be available. This is a commma seperated list of collection names (see tool list below for collection names).

- `UMBRACO_EXCLUDE_TOOL_COLLECTIONS`

The allows you to specify collections by name if you wish to exclude them from the usable tools list. This is a commma seperated list of collection names (see tool list below for collection names).

### Tool Collections

**Note:** Collection names are shown in brackets for use with `UMBRACO_INCLUDE_TOOL_COLLECTIONS` and `UMBRACO_EXCLUDE_TOOL_COLLECTIONS`.

<details>
<summary> View Tool list</summary>
<br>

<details>
<summary>Culture (culture)</summary>
<br>

`get-culture` - gets all cultures avaliable to Umbraco  
</details>

<details>
<summary>Data Type (data-type)</summary>
<br>

`get-data-type-search` - Search for data types  
`get-data-type` - Get a specific data type by ID  
`get-data-type-references` - Get references to a data type  
`is-used-data-type` - Check if a data type is in use  
`get-data-type-root` - Get root level data types  
`get-data-type-children` - Get child data types  
`get-data-type-ancestors` - Get ancestor data types  
`get-all-data-types` - Get all data types  
`delete-data-type` - Delete a data type  
`create-data-type` - Create a new data type  
`update-data-type` - Update an existing data type  
`copy-data-type` - Copy a data type  
`move-data-type` - Move a data type to a different location  
`create-data-type-folder` - Create a folder for organizing data types  
`delete-data-type-folder` - Delete a data type folder  
`get-data-type-folder` - Get information about a data type folder  
`update-data-type-folder` - Update a data type folder details
</details>

<details>
<summary>Dictionary (dictionary)</summary>
<br>

`get-dictionary-search` - Search for dictionary items  
`get-dictionary-by-key` - Get a dictionary item by key  
`create-dictionary` - Create a new dictionary item  
`update-dictionary` - Update a dictionary item  
`delete-dictionary` - Delete a dictionary item  
</details>

<details>
<summary>Document (document)</summary>
<br>

`get-document-by-id` - Get a document by ID  
`get-document-publish` - Get document publish status  
`get-document-configuration` - Get document configuration  
`copy-document` - Copy a document  
`create-document` - Create a new document  
`post-document-public-access` - Set document public access  
`delete-document` - Delete a document  
`delete-document-public-access` - Remove public access from a document  
`get-document-urls` - Get document URLs  
`get-document-domains` - Get document domains  
`get-document-audit-log` - Get document audit log  
`get-document-public-access` - Get document public access settings  
`move-document` - Move a document  
`move-to-recycle-bin` - Move document to recycle bin  
`get-document-notifications` - Get document notifications  
`publish-document` - Publish a document  
`publish-document-with-descendants` - Publish a document and its descendants  
`sort-document` - Sort document order  
`unpublish-document` - Unpublish a document  
`update-document` - Update a document  
`put-document-domains` - Update document domains  
`put-document-notifications` - Update document notifications  
`put-document-public-access` - Update document public access  
`delete-from-recycle-bin` - Delete document from recycle bin  
`empty-recycle-bin` - Empty the recycle bin  
`get-recycle-bin-root` - Get root items in recycle bin  
`get-recycle-bin-children` - Get child items in recycle bin  
`search-document` - Search for documents  
`validate-document` - Validate a document  
`get-document-root` - Get root documents  
`get-document-children` - Get child documents  
`get-document-ancestors` - Get document ancestors
</details>

<details>
<summary>Document Blueprint (document-blueprint)</summary>
<br>

`get-blueprint` - Get a document blueprint  
`delete-blueprint` - Delete a document blueprint  
`update-blueprint` - Update a document blueprint  
`create-blueprint` - Create a new document blueprint  
`get-blueprint-ancestors` - Get blueprint ancestors  
`get-blueprint-children` - Get blueprint children  
`get-blueprint-root` - Get root blueprints
</details>

<details>
<summary>Document Version (document-version)</summary>
<br>

`get-document-version` - Get document versions with pagination  
`get-document-version-by-id` - Get a specific document version by ID  
`update-document-version-prevent-cleanup` - Prevent or allow cleanup of a document version  
`create-document-version-rollback` - Rollback a document to a specific version
</details>

<details>
<summary>Document Type (document-type)</summary>
<br>

`get-document-type` - Get a document type  
`get-document-type-configuration` - Get document type configuration  
`get-document-type-blueprint` - Get document type blueprint  
`get-document-type-by-id-array` - Get document types by IDs  
`get-document-type-available-compositions` - Get available compositions  
`get-document-type-composition-references` - Get composition references  
`update-document-type` - Update a document type  
`copy-document-type` - Copy a document type  
`move-document-type` - Move a document type  
`create-document-type` - Create a new document type  
`delete-document-type` - Delete a document type  
`create-element-type` - Create an element type  
`get-icons` - Get available icons  
`get-document-type-allowed-children` - Get allowed child types  
`get-all-document-types` - Get all document types  
`create-document-type-folder` - Create a folder  
`delete-document-type-folder` - Delete a folder  
`get-document-type-folder` - Get folder info  
`update-document-type-folder` - Update folder details  
`get-document-type-root` - Get root document types  
`get-document-type-ancestors` - Get document type ancestors  
`get-document-type-children` - Get document type children
</details>

<details>
<summary>Health (health)</summary>
<br>

`get-health-check-groups` - Get all health check groups
`get-health-check-group-by-name` - Get health check group by name
`run-health-check-group` - Run health checks for a specific group
`execute-health-check-action` - Execute a health check action
</details>

<details>
<summary>Imaging (imaging)</summary>
<br>

`get-imaging-resize-urls` - Generate image resize URLs with various processing options
</details>

<details>
<summary>Indexer (indexer)</summary>
<br>

`get-indexer` - Get all indexers
`get-indexer-by-index-name` - Get indexer by index name
`post-indexer-by-index-name-rebuild` - Rebuild an index by name
</details>

<details>
<summary>Language (language)</summary>
<br>

`get-language-items` - Get all languages
`get-default-language` - Get default language
`create-language` - Create a new language
`update-language` - Update a language
`delete-language` - Delete a language
`get-language-by-iso-code` - Get language by ISO code
</details>

<details>
<summary>Log Viewer (log-viewer)</summary>
<br>

`get-log-viewer-saved-search-by-name` - Get saved search by name
`get-log-viewer-level-count` - Get log level counts
`post-log-viewer-saved-search` - Save a log search
`delete-log-viewer-saved-search-by-name` - Delete saved search
`get-log-viewer` - Get logs
`get-log-viewer-level` - Get log levels
`get-log-viewer-search` - Search logs
`get-log-viewer-validate-logs` - Validate logs
`get-log-viewer-message-template` - Get message template
</details>

<details>
<summary>Manifest (manifest)</summary>
<br>

`get-manifest-manifest` - Get all system manifests
`get-manifest-manifest-private` - Get private manifests
`get-manifest-manifest-public` - Get public manifests
</details>

<details>
<summary>Media (media)</summary>
<br>

`get-media-by-id` - Get media by ID  
`get-media-ancestors` - Get media ancestors  
`get-media-children` - Get media children  
`get-media-root` - Get root media items  
`create-media` - Create new media  
`delete-media` - Delete media  
`update-media` - Update media  
`get-media-configuration` - Get media configuration  
`get-media-urls` - Get media URLs  
`validate-media` - Validate media  
`sort-media` - Sort media items  
`get-media-by-id-array` - Get media by IDs  
`move-media` - Move media  
`get-media-audit-log` - Get media audit log  
`get-media-recycle-bin-root` - Get recycle bin root  
`get-media-recycle-bin-children` - Get recycle bin children  
`empty-recycle-bin` - Empty recycle bin  
`restore-from-recycle-bin` - Restore from recycle bin  
`move-media-to-recycle-bin` - Move to recycle bin  
`delete-from-recycle-bin` - Delete from recycle bin
</details>

<details>
<summary>Media Type (media-type)</summary>
<br>

`get-media-type-configuration` - Get media type configuration  
`get-media-type-by-id` - Get media type by ID  
`get-media-type-by-ids` - Get media types by IDs  
`get-allowed` - Get allowed media types  
`get-media-type-allowed-at-root` - Get types allowed at root  
`get-media-type-allowed-children` - Get allowed child types  
`get-media-type-composition-references` - Get composition references  
`get-root` - Get root media types  
`get-children` - Get child media types  
`get-ancestors` - Get ancestor media types  
`get-folder` - Get folder information  
`create-folder` - Create a new folder  
`delete-folder` - Delete a folder  
`update-folder` - Update folder details  
`create-media-type` - Create a new media type  
`copy-media-type` - Copy a media type  
`get-media-type-available-compositions` - Get available compositions  
`update-media-type` - Update a media type  
`move-media-type` - Move a media type  
`delete-media-type` - Delete a media type
</details>

<details>
<summary>Member (member)</summary>
<br>

`get-member` - Get member by ID  
`create-member` - Create a new member  
`delete-member` - Delete a member  
`update-member` - Update a member  
`find-member` - Find members
</details>

<details>
<summary>Member Group (member-group)</summary>
<br>

`get-member-group` - Get member group  
`get-member-group-by-id-array` - Get member groups by IDs  
`create-member-group` - Create a new member group  
`update-member-group` - Update a member group  
`delete-member-group` - Delete a member group  
`get-member-group-root` - Get root member groups
</details>

<details>
<summary>Member Type (member-type)</summary>
<br>

`get-member-type-by-id` - Get member type by ID
`create-member-type` - Create a new member type
`get-member-type-by-id-array` - Get member types by IDs
`delete-member-type` - Delete a member type
`update-member-type` - Update a member type
`copy-member-type` - Copy a member type
`get-member-type-available-compositions` - Get available compositions
`get-member-type-composition-references` - Get composition references
`get-member-type-configuration` - Get member type configuration
`get-member-type-root` - Get root member types
</details>

<details>
<summary>Models Builder (models-builder)</summary>
<br>

`get-models-builder-dashboard` - Get Models Builder dashboard information
`get-models-builder-status` - Get Models Builder status
`post-models-builder-build` - Trigger Models Builder code generation
</details>

<details>
<summary>Partial View (partial-view)</summary>
<br>

`get-partial-view-by-path` - Get partial view by path  
`get-partial-view-folder-by-path` - Get partial view folder by path  
`get-partial-view-snippet-by-id` - Get partial view snippet by ID  
`get-partial-view-snippet` - Get partial view snippet  
`create-partial-view` - Create a new partial view  
`create-partial-view-folder` - Create a partial view folder  
`update-partial-view` - Update a partial view  
`rename-partial-view` - Rename a partial view  
`delete-partial-view` - Delete a partial view  
`delete-partial-view-folder` - Delete a partial view folder  
`get-partial-view-root` - Get root partial views  
`get-partial-view-children` - Get child partial views  
`get-partial-view-ancestors` - Get partial view ancestors  
`get-partial-view-search` - Search partial views
</details>

<details>
<summary>Property Type (property-type)</summary>
<br>

`get-property-type` - Get property type by ID  
`get-property-type-all-property-type-groups` - Get all property type groups  
`create-property-type` - Create a new property type  
`update-property-type` - Update a property type  
`delete-property-type` - Delete a property type
</details>

<details>
<summary>Redirect (redirect)</summary>
<br>

`get-all-redirects` - Get all redirects
`get-redirect-by-id` - Get redirect by ID
`delete-redirect` - Delete a redirect
`get-redirect-status` - Get redirect status
`update-redirect-status` - Update redirect status
</details>

<details>
<summary>Relation (relation)</summary>
<br>

`get-relation-by-relation-type-id` - Get relations by relation type ID
</details>

<details>
<summary>Relation Type (relation-type)</summary>
<br>

`get-relation-type` - Get all relation types
`get-relation-type-by-id` - Get relation type by ID
</details>

<details>
<summary>Script (script)</summary>
<br>

`get-script-by-path` - Get script by path
`get-script-folder-by-path` - Get script folder by path
`get-script-items` - Get script items
`create-script` - Create a new script
`create-script-folder` - Create a script folder
`update-script` - Update a script
`rename-script` - Rename a script
`delete-script` - Delete a script
`delete-script-folder` - Delete a script folder
`get-script-tree-root` - Get root script items
`get-script-tree-children` - Get child script items
`get-script-tree-ancestors` - Get script ancestors
</details>

<details>
<summary>Searcher (searcher)</summary>
<br>

`get-searcher` - Get all searchers
`get-searcher-by-searcher-name-query` - Query a specific searcher by name
</details>

<details>
<summary>Server (server)</summary>
<br>

`get-server-status` - Get server status
`get-server-log-file` - Get server log file
`tour-status` - Get tour status
`upgrade-status` - Get upgrade status
</details>

<details>
<summary>Static File (static-file)</summary>
<br>

`get-static-files` - Get static files with filtering
`get-static-file-root` - Get root static files
`get-static-file-children` - Get child static files
`get-static-file-ancestors` - Get static file ancestors
</details>

<details>
<summary>Stylesheet (stylesheet)</summary>
<br>

`get-stylesheet-by-path` - Get stylesheet by path
`get-stylesheet-folder-by-path` - Get stylesheet folder by path
`create-stylesheet` - Create a new stylesheet
`create-stylesheet-folder` - Create a stylesheet folder
`update-stylesheet` - Update a stylesheet
`rename-stylesheet` - Rename a stylesheet
`delete-stylesheet` - Delete a stylesheet
`delete-stylesheet-folder` - Delete a stylesheet folder
`get-stylesheet-root` - Get root stylesheets
`get-stylesheet-children` - Get child stylesheets
`get-stylesheet-ancestors` - Get stylesheet ancestors
`get-stylesheet-search` - Search stylesheets
</details>

<details>
<summary>Tag (tag)</summary>
<br>

`get-tags` - Get all tags
</details>

<details>
<summary>Template (template)</summary>
<br>

`get-template-search` - Search for templates by name  
`get-template` - Get a template by ID  
`get-templates-by-id-array` - Get templates by IDs  
`create-template` - Create a new template  
`update-template` - Update a template by ID  
`delete-template` - Delete a template by ID  
`execute-template-query` - Execute template queries and return generated LINQ code  
`get-template-query-settings` - Get schema for template queries (document types, properties, operators)  
`get-template-root` - Get root template items  
`get-template-children` - Get child templates or template folders by parent ID  
`get-template-ancestors` - Get ancestors of a template by ID
</details>

<details>
<summary>Temporary File (temporary-file)</summary>
<br>

`create-temporary-file` - Create a temporary file
`get-temporary-file` - Get a temporary file
`delete-temporary-file` - Delete a temporary file
`get-temporary-file-configuration` - Get temporary file configuration
</details>

<details>
<summary>User (user)</summary>
<br>

`get-user` - Get users with pagination
`get-user-by-id` - Get user by ID
`find-user` - Find users by search criteria
`get-item-user` - Get user item information
`get-user-current` - Get current authenticated user
`get-user-configuration` - Get user configuration
`get-user-current-configuration` - Get current user configuration
`get-user-current-login-providers` - Get current user login providers
`get-user-current-permissions` - Get current user permissions
`get-user-current-permissions-document` - Get current user document permissions
`get-user-current-permissions-media` - Get current user media permissions
`get-user-by-id-calculate-start-nodes` - Calculate start nodes for a user
`upload-user-avatar-by-id` - Upload avatar for a user
`upload-user-current-avatar` - Upload avatar for current user
`delete-user-avatar-by-id` - Delete user avatar
</details>

<details>
<summary>User Data (user-data)</summary>
<br>

`create-user-data` - Create user data key-value pair
`update-user-data` - Update user data value
`get-user-data` - Get all user data for current user
`get-user-data-by-id` - Get user data by key
</details>

<details>
<summary>User Group (user-group)</summary>
<br>

`get-user-group` - Get user group
`get-user-group-by-id-array` - Get user groups by IDs
`get-user-groups` - Get all user groups
`get-filter-user-group` - Filter user groups
`create-user-group` - Create a new user group
`update-user-group` - Update a user group
`delete-user-group` - Delete a user group
`delete-user-groups` - Delete multiple user groups
</details>

<details>
<summary>Webhook (webhook)</summary>
<br>

`get-webhook-by-id` - Get webhook by ID  
`get-webhook-by-id-array` - Get webhooks by IDs  
`delete-webhook` - Delete a webhook  
`update-webhook` - Update a webhook  
`get-webhook-events` - Get webhook events  
`get-all-webhook-logs` - Get all webhook logs  
`create-webhook` - Create a new webhook
</details>
</details>

**⚠️ Intentionally Excluded:** 69 endpoints across 14 categories

Certain endpoints are intentionally not implemented due to security, complexity, or contextual concerns. For a detailed breakdown of excluded endpoints and the rationale behind each exclusion, see [Ignored Endpoints Documentation](./docs/analysis/IGNORED_ENDPOINTS.md).

### Excluded Categories Summary

- **User Management (22 endpoints)** - User creation/deletion, password operations, 2FA management, and client credentials pose significant security risks
- **User Group Membership (3 endpoints)** - Permission escalation risks from AI-driven group membership changes
- **Security Operations (4 endpoints)** - Password reset workflows require email verification and user interaction
- **Import/Export (9 endpoints)** - Complex file operations better handled through the Umbraco UI
- **Package Management (9 endpoints)** - Package creation and migration involve system-wide changes
- **Cache Operations (3 endpoints)** - Cache rebuild can impact system performance
- **Telemetry (3 endpoints)** - System telemetry configuration and data collection
- **Install/Upgrade (5 endpoints)** - One-time system setup and upgrade operations
- **Preview/Profiling (4 endpoints)** - Frontend-specific debugging functionality
- **Other (7 endpoints)** - Internal system functionality, oEmbed, dynamic roots, object types

## Contributing with AI Tools

This project is optimized for development with AI coding assistants. We provide instruction files for popular AI tools to help maintain consistency with our established patterns and testing standards.

### Using rulesync

The project includes rulesync configuration files that can automatically generate instruction files for 19+ AI development tools. Generate configuration files for your preferred AI tools:

```bash
# Generate only for Claude Code
npx rulesync generate --claudecode

# Generate only for Cursor
npx rulesync generate --cursor

# Generate only for Vs Code Copilot
npx rulesync generate --copilot
```

### Other AI Tools

rulesync supports 19+ AI development tools including GitHub Copilot, Cline, Aider, and more. Check the [rulesync repository](https://github.com/dyoshikawa/rulesync) for the complete list of supported tools.

The instruction files cover:
- MCP development patterns and conventions
- TypeScript implementation guidelines  
- Comprehensive testing standards with builders and helpers
- Project-specific context and architecture
- API integration patterns with Umbraco Management API  
