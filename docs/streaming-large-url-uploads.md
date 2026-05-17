# Streaming URL uploads — `create-media-from-url-stream`

The default `create-media` URL path can't reliably upload files past roughly
3 MB on the hosted Worker. The fetch from the source URL completes, but the
worker then buffers the entire payload (multiple times: `Buffer` → `Uint8Array`
→ `Blob`), and the subsequent POST to Umbraco's TempFile endpoint serialises
synchronously. The combined wall-clock blows past the MCP transport's ~30s
ceiling and the call surfaces as `TimeoutError:` on the client.

`create-media-from-url-stream` exists for that case. Same inputs as the URL
variant of `create-media` (URL, name, media type, optional parent), but:

- Bypasses the orval-generated `postTemporaryFile` client entirely.
- Pipes the source `response.body` straight into a custom multipart
  `ReadableStream` body for a `fetch` to Umbraco's TempFile endpoint.
- `duplex: "half"` lets the Drive download and the Umbraco upload run
  concurrently; total wall-clock collapses from `download + upload` to
  roughly `max(download, upload)`.

End-to-end on `umbraco-cms-dev-mcp-staging`, the 3.57 MB Drive JPEG that
consistently timed out via `create-media` round-trips in well under the MCP
timeout via this tool (`f3873059-ceec-4f43-94ce-630c5b5939d6` for the record).

## When to use which

- **`create-media`** — small files (sub-MB), or when you already have base64
  bytes locally and can pass them inline.
- **`create-media-from-url-stream`** — files in the few-MB range fetched from
  a public URL. Same URL constraints (must be a direct-download link with no
  auth; share/viewer URLs must be transformed first — see
  `upload-from-google-drive.md`).
- **`create-media-from-file`** — files the chat host has attached for you
  (ChatGPT generated images, ChatGPT user-uploaded files, etc.) — see
  `openai-file-params.md`.

The streaming tool's description nudges the model to prefer it for files over
~1 MB, so in practice you should rarely need to specify which to use.

## Implementation notes

The tool is registered directly on the `McpServer` in `worker.ts` (rather
than through a collection) because it needs the per-tenant base URL and
KV-stored OAuth token directly — both of which the orval client hides. The
auth context is stashed by `setStreamingAuthContext()` immediately after
`createPerRequestServer` returns; since each Durable Object instance handles
one request at a time, the module-level slot is per-DO and safe.

Before each streaming POST, the tool issues a cheap SDK call
(`getTemporaryFileConfiguration`) to give the SDK's transport a chance to
refresh the OAuth token on 401 and write it back to KV — otherwise our
direct read might pull a stale token.

## Drive-by fix in the same change

`umbraco-auth-policies.ts` now guards every predicate with
`(user.allowedSections ?? [])` / `(user.userGroupIds ?? [])`. The hosted
SDK's `fetchCurrentUser` returns `{}` on failure (typically during an OAuth
refresh window), and the predicates were unconditionally calling `.some()`
on those undefined fields. That blew up inside `createPerRequestServer` and
silently aborted `init()`, dropping every tool registered after that point
in `worker.ts` — including the file/streaming tools above. Defensive `?? []`
is the smallest change that unblocks the init.
