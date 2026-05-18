# Streaming large file uploads

The naïve URL-fetch path can't reliably upload files past roughly 3 MB on the
hosted Worker. The fetch from the source URL completes, but the worker then
buffers the entire payload (multiple times: `Buffer` → `Uint8Array` → `Blob`),
and the subsequent POST to Umbraco's TempFile endpoint serialises
synchronously. The combined wall-clock blows past the MCP transport's ~30s
ceiling and the call surfaces as `TimeoutError:` on the client.

`create-media` (`sourceType: "url"` and `sourceType: "file"`) and
`create-media-multiple` (same source types per entry) now stream through a
custom helper (`helpers/streaming-upload.ts`) when running on the hosted
Worker. The helper:

- Bypasses the orval-generated `postTemporaryFile` client entirely.
- Pipes the source `response.body` straight into a custom multipart
  `ReadableStream` body for a `fetch` to Umbraco's TempFile endpoint.
- `duplex: "half"` lets the Drive download and the Umbraco upload run
  concurrently; total wall-clock collapses from `download + upload` to
  roughly `max(download, upload)`.

End-to-end on `umbraco-cms-dev-mcp-staging`, a 3.57 MB Drive JPEG that
consistently timed out via the buffered path now round-trips well under the
MCP timeout (`f3873059-ceec-4f43-94ce-630c5b5939d6` for the record).

## When to use which `sourceType`

- **`sourceType: "file"`** — host-attached chat files (ChatGPT-attached
  images, ChatGPT-generated images, Claude.ai chat attachments). The
  connector populates the `file` object on the call automatically via
  `openai/fileParams`. Preferred for anything already in the conversation —
  see `openai-file-params.md`.
- **`sourceType: "url"`** — public direct-download URLs (Drive / Dropbox /
  Unsplash / etc.). The URL must be a direct-download link with no auth;
  share/viewer URLs must be transformed first — see
  `upload-from-google-drive.md`.
- **`sourceType: "base64"`** (single-file only) — tiny inline payloads
  (≤10 KiB decoded). Larger base64 is hard-rejected because LLMs reliably
  truncate big base64 strings, producing corrupt files.

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
