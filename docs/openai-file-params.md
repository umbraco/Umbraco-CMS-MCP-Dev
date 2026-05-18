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

The reference example is the `sourceType: "file"` branch of `create-media`
(`src/umb-management-api/tools/media/post/create-media.ts`) and the
`sourceType: "file"` branch of `create-media-multiple`
(`src/umb-management-api/tools/media/post/create-media-multiple.ts`). Both
declare `_meta: { "openai/fileParams": ["file"] }` (or `["files"]` for the
batch tool) and reuse the streaming `streamingUploadFromUrl` helper via the
host-provided `download_url`.

## Wire-format protection (nested-object pass-through)

The connector's `file` object is the host's contract, not ours — the
`withInputSanitization` decorator in `@umbraco-cms/mcp-server-sdk` must
not reshape it. We use the `[raw]` marker on the `file` field's
`.describe()` to opt the whole subtree out of sanitisation. Top-level
string siblings (e.g. `name`, `mediaTypeName`) are still validated.

See umbraco/Umbraco-MCP-Base#133 for the SDK-level fix that makes
`withStandardDecorators` safe to wrap on file-injection tools.
