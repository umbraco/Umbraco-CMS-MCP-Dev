// For files the chat host has attached or generated. ChatGPT populates `file`
// via the `openai/fileParams` `_meta` declaration with a `{ download_url,
// file_id, ... }` object; the handler then streams from `download_url`.
//
// Lives in the regular media collection now that `@umbraco-cms/mcp-hosted`
// forwards `_meta` from `ToolDefinition` to `tools/list`.

import { z } from "zod";
import { streamingUploadToToolResult } from "./helpers/streaming-upload.js";
import {
  type ToolDefinition,
  MEDIA_TYPE_ARTICLE,
  MEDIA_TYPE_AUDIO,
  MEDIA_TYPE_FILE,
  MEDIA_TYPE_IMAGE,
  MEDIA_TYPE_VECTOR_GRAPHICS,
  MEDIA_TYPE_VIDEO,
} from "@umbraco-cms/mcp-server-sdk";

// Shape the host injects for an `openai/fileParams`-declared field. The field
// MUST be required — when it's `.optional()` ChatGPT's connector serialises
// the file as a bare string instead of this object.
const fileObjectSchema = z.object({
  download_url: z.string().describe("Temporary URL the host provides to fetch the file bytes"),
  file_id: z.string().describe("Persistent file identifier from the host"),
  mime_type: z.string().optional().describe("MIME type if the host knows it"),
  file_name: z.string().optional().describe("Original file name if the host knows it"),
});

const schema = z.object({
  file: fileObjectSchema.describe(
    "Host-injected file object. ChatGPT's connector populates this automatically when the user attached a file or you generated one in the same chat."
  ),
  name: z.string().describe("The name of the media item"),
  mediaTypeName: z.string().describe(
    `Media type: '${MEDIA_TYPE_IMAGE}', '${MEDIA_TYPE_ARTICLE}', '${MEDIA_TYPE_AUDIO}', '${MEDIA_TYPE_VIDEO}', '${MEDIA_TYPE_VECTOR_GRAPHICS}', '${MEDIA_TYPE_FILE}', or a custom media type name`
  ),
  parentId: z.string().uuid().optional().describe("Parent folder ID (defaults to root)"),
});

type Params = z.infer<typeof schema>;

export const createMediaFromFileOutputSchema = z.object({
  message: z.string(),
  name: z.string(),
  id: z.string().guid(),
});

const tool = {
  name: "create-media-from-file",
  description:
    "Upload a media file to Umbraco using a file reference provided by the chat host (ChatGPT-generated image, user-attached file, etc.). " +
    "Prefer this over `create-media` whenever the source is a file already in the conversation — the host will inject a `{ download_url, file_id }` object on the `file` parameter automatically. " +
    "For public URLs (Drive / Dropbox / Unsplash / etc.), use `create-media` with sourceType=\"url\".",
  inputSchema: schema.shape,
  outputSchema: createMediaFromFileOutputSchema.shape,
  slices: ["create"],
  _meta: { "openai/fileParams": ["file"] },
  handler: (async (model: Params) =>
    streamingUploadToToolResult({
      sourceUrl: model.file.download_url,
      name: model.name,
      mediaTypeName: model.mediaTypeName,
      parentId: model.parentId,
    })),
} satisfies ToolDefinition<typeof schema.shape, typeof createMediaFromFileOutputSchema.shape>;

// Not wrapped in `withStandardDecorators`: the input-sanitization decorator
// reshapes the file object and breaks the connector's expected wire format.
export default tool;
