# Accepting ChatGPT-attached files: `openai/fileParams`

When a ChatGPT user attaches a file or asks the model to upload a file it
generated (e.g. `/mnt/data/foo.png`), ChatGPT's connector layer **will not**
forward that path as a plain string. It expects the MCP server to declare
which tool parameters are file inputs. Without that declaration, the call is
aborted before reaching the worker with:

```
ValueError: File arg rewrite paths are required when proxied mounts are present.
```

With the declaration, ChatGPT uploads the file to its own hosted store and
passes the tool an object:

```
{ download_url, file_id, mime_type?, file_name? }
```

The `download_url` is a temporary, publicly-fetchable URL valid for the
duration of the tool call.

## How to add a file-input tool

1. Make the file parameter a top-level object on the input schema with the
   four fields above.
2. Declare the parameter in `_meta`:

   ```ts
   _meta: { "openai/fileParams": ["file"] }
   ```

3. In the handler, `fetch(file.download_url)` to get a `Buffer`/`Blob` and
   feed it into whatever upload path you already have.

`create-media-from-file` (`src/umb-management-api/tools/media/post/
create-media-from-file.ts`) is the reference example. It fetches the bytes
and reuses the existing `uploadMediaFile` helper via `sourceType: "url"`.

## Why it's registered directly on `McpServer`

The hosted SDK's collection-registration loop in
`@umbraco-cms/mcp-hosted` does **not** currently forward `_meta` from
`ToolDefinition` to `McpServer.registerTool` — so a tool defined the usual
way through a collection will be exposed without its `openai/fileParams`
metadata, and the connector will keep refusing sandbox files.

The workaround is to register the tool directly on the per-request
`McpServer` instance in `src/worker.ts`, after `createPerRequestServer`
returns. Once the SDK is updated to forward `_meta`, this can collapse back
into the regular media collection.
