# Uploading files to Umbraco from Google Drive

The existing `create-media` tool accepts `sourceType: "url"` with any
publicly-fetchable URL. Google Drive shareable links work as long as you
convert them to the direct-download form first — the `…/file/d/<id>/view`
URL the share dialog gives you is an HTML viewer, not the bytes.

## URL transformation

Given a share URL like

```
https://drive.google.com/file/d/1APmI9THGFpdz6-Tlf_IlMhfw9ojCNBYS/view?usp=sharing
```

extract the file id between `/file/d/` and `/view`, then construct either:

```
https://drive.google.com/uc?export=download&id=<FILE_ID>
```

(which 302-redirects to `drive.usercontent.google.com`) or use the
redirect target directly:

```
https://drive.usercontent.google.com/download?id=<FILE_ID>&export=download
```

Both return the file bytes with a proper `Content-Type`. The file must be
shared with **Anyone with the link** — files restricted to a Google
account can't be fetched anonymously by the worker.

## Calling `create-media`

```json
{
  "sourceType": "url",
  "fileUrl": "https://drive.google.com/uc?export=download&id=<FILE_ID>",
  "name": "my-asset",
  "mediaTypeName": "Image"
}
```

`mediaTypeName` follows the standard set (`Image`, `Article`, `Audio`,
`Video`, `Vector Graphics (SVG)`, `File`, or a custom type). The tool
auto-appends an extension to `name` if one isn't provided — derived from
either the URL path or the `Content-Type` header.

## Known limits

- **Worker invocation budget.** The hosted worker fetches the bytes into
  a `Buffer` and then POSTs them as multipart form-data to Umbraco's
  Temporary File endpoint. Both legs count toward the Cloudflare Worker
  invocation/wall-clock budget, and an MCP client (e.g. ChatGPT) has its
  own ~30s timeout on the tool response. Observed on `cms-dev-staging`:
  a 188 KB Drive JPEG and a 2.2 MB generated PNG round-tripped cleanly,
  whereas a 3.57 MB Drive JPEG consistently surfaced as `TimeoutError:`
  on the client even though the URL fetch itself completed in the worker
  logs. Tracked in issue #225.
- **Drive virus-scan interstitial.** Files large enough to skip Google's
  inline scan return an HTML confirmation page instead of bytes on the
  first request. None of the small/medium images this workflow targets
  hit that limit, but if you ever see a `text/html` response with a
  `confirm=` token, the file needs the two-request `&confirm=t` dance
  — outside the scope of `create-media`'s plain URL fetch.
- **No private Drive auth.** OAuth-restricted files aren't supported —
  use the `create-media-from-file` flow (`docs/openai-file-params.md`)
  instead, which lets the host (ChatGPT) attach the file via its own
  hosted store.

## Why we can't proxy Drive through `create-media-from-file`

It looks tempting to route the bytes "ChatGPT pulls from Drive → Umbraco
MCP pushes to Umbraco" so the worker fetches a fast OpenAI-hosted URL
instead of Drive directly. In practice this doesn't work:

- ChatGPT's code-interpreter sandbox has no DNS for `drive.google.com`
  (`urlopen error [Errno -3] Temporary failure in name resolution`).
- The built-in web fetch tool refuses Drive download endpoints too
  (`Failed to fetch …drive.google.com/uc?export=download&id=…`).
- ChatGPT's Google Drive connector and a third-party MCP connector
  (Umbraco MCP) cannot both be active in the same developer-mode chat,
  so even when both are configured, only one is exposed to the model at
  a time. There is no bridge step inside ChatGPT that can hand a Drive
  file off to a separate MCP connector.

So the only path that actually goes "Drive → Umbraco" in one prompt is
the `create-media` URL fetch above. `create-media-from-file` remains the
right tool for files the user has **directly attached to the chat** (or
that ChatGPT generated), but it can't be used to launder a Drive link.
