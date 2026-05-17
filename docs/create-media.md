# `create-media` — one tool, four source types

A single `create-media` tool covers every way a chat host might hand you a
file. The handler dispatches on `sourceType`:

| `sourceType` | When to use | How the bytes get to Umbraco |
|--------------|-------------|------------------------------|
| `url` | Public, direct-download URL. Drive, Dropbox, Unsplash, S3 public, etc. | Streamed via a custom multipart `ReadableStream` with `duplex: "half"`. No buffer copies; source download + Umbraco upload run concurrently. Multi-MB files round-trip without timing out. |
| `file` | Host (ChatGPT) attached or generated the file in this chat. | `_meta: { "openai/fileParams": ["file"] }` makes ChatGPT's connector populate a `{ download_url, file_id, mime_type, file_name }` object; the handler then streams from `download_url` through the same path as `url`. |
| `base64` | Tiny inline data. | Buffered through the orval client. Cheap for <10 KB; trips token limits past that. |
| `filePath` | Local filesystem path. | Buffered through the orval client. Node stdio only — no filesystem on Workers, so the source-type is omitted from the schema there. |

The `_meta` declaration is the key bit. ChatGPT's connector only injects a
file object into the `file` field when the user actually has a file in the
conversation — URL/base64 callers see no change.

## URL transform recipe (Google Drive)

A Drive share URL like

```
https://drive.google.com/file/d/<FILE_ID>/view?usp=sharing
```

is an HTML viewer, not the bytes. Convert it to a direct-download URL:

```
https://drive.google.com/uc?export=download&id=<FILE_ID>
```

(which 302-redirects to `drive.usercontent.google.com/download?...`).
Same idea for Dropbox (`?dl=1`) and OneDrive (their public-share endpoints).
The file must be shared with "Anyone with the link" — files restricted to a
Google account can't be fetched anonymously.

For files **the host has access to but you don't**, use `create-media-from-file`
(or in Claude.ai, just attach the file to the chat — Claude has its own
Google Drive connector).

### Claude.ai + streaming

Once a Claude.ai workspace has this MCP added as a custom connector, the
streaming path works there too. The gotcha: Claude's Drive connector
exposes `read_file_content` which returns base64 — if you let Claude take
that path, it'll cram the whole file through the model context (and hit
`create-media` `sourceType: "base64"` which has a sensible <10 KB cap).
Prompt Claude to use the `uc?export=download&id=…` URL directly and call
`create-media` with `sourceType: "url"` instead — Claude knows the file id
from a Drive search, so it can construct the URL without ever loading the
bytes itself.

## Why streaming?

Pre-streaming, the URL path went: `fetch(url)` → `arrayBuffer` →
`Buffer.from` → `Uint8Array` → `Blob` → `FormData` → orval → `fetch`. Three
full copies of the file before the upload to Umbraco even starts, all
serial. For files in the few-MB range the combined wall-clock blew past the
MCP transport's ~30s ceiling and surfaced as `TimeoutError:` on the client.

Streaming pipes `sourceResp.body` straight into a hand-rolled multipart
`ReadableStream` consumed by `fetch(umbracoTempFile, { duplex: "half" })`.
The worker holds at most one network chunk at a time, and the download +
upload happen concurrently — so total wall-clock collapses from
`download + upload` to roughly `max(download, upload)`. The 3.57 MB Drive
JPEG that consistently timed out via the buffered path now round-trips
cleanly (verified on `umbraco-cms-dev-mcp-staging`).

## Implementation pointers

- Streaming logic lives in `src/umb-management-api/tools/media/post/helpers/streaming-upload.ts`.
- It needs the per-tenant base URL and the KV-stored OAuth token; the worker
  stashes those via `setStreamingAuthContext({ env, tokenKey })` in `init()`.
- Before each streaming POST, the helper issues a cheap SDK call
  (`getTemporaryFileConfiguration`) so the SDK can refresh the token on 401
  and write the new one back to KV before we read it directly.
- The base SDK now forwards `tool._meta` through to `tools/list`, so the
  tool can live in the regular `media` collection — no `worker.ts`
  side-channel registration needed.

## Older docs

Two earlier docs in this folder
(`openai-file-params.md`, `streaming-large-url-uploads.md`,
`upload-from-google-drive.md`) describe the multi-tool predecessor that
shipped before the SDK's `_meta` forwarding landed. They're kept for now
because the `openai/fileParams` and Drive URL-transform explanations there
are still accurate, but the "register the tool directly on the McpServer"
workarounds they describe are no longer required.
