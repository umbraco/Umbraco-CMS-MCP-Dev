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
  own ~30s timeout on the tool response. On `cms-dev-staging`, files
  around **3 MB+** can hit this ceiling and surface as `TimeoutError:`
  on the client side even though the URL fetch itself completed. Small
  files (verified up to ~2 MB end-to-end) round-trip reliably.
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
