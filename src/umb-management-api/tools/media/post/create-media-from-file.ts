/**
 * `create-media-from-file` — for files the chat host has attached or generated
 * for us. ChatGPT's connector populates the `file` parameter with a
 * `{ download_url, file_id, mime_type, file_name }` object thanks to the
 * `_meta: { "openai/fileParams": ["file"] }` declaration; the handler then
 * streams from `download_url` through the same path as `create-media`'s url
 * source type.
 *
 * Why a separate tool from `create-media`? An openai/fileParams-declared
 * parameter must be required, not optional — when it's optional, the
 * connector serialises the file_id as a bare string instead of the expected
 * object. So this tool exists as a sibling: required `file`, no other source
 * types. Use this when the user attached a file (or ChatGPT generated one in
 * the same chat); use `create-media` for URLs / base64 / local paths.
 *
 * Now lives in the regular `media` collection — the SDK's
 * `registerCollectionTools` loop forwards `_meta` to `tools/list` as of
 * @umbraco-cms/mcp-hosted@17.0.0-beta.26.
 */
import { z } from "zod";
import { streamingUploadFromUrl } from "./helpers/streaming-upload.js";
import {
  type ToolDefinition,
  createToolResult,
  createToolResultError,
  MEDIA_TYPE_ARTICLE,
  MEDIA_TYPE_AUDIO,
  MEDIA_TYPE_FILE,
  MEDIA_TYPE_IMAGE,
  MEDIA_TYPE_VECTOR_GRAPHICS,
  MEDIA_TYPE_VIDEO,
  withStandardDecorators,
} from "@umbraco-cms/mcp-server-sdk";

// Shape ChatGPT's connector injects for an `openai/fileParams`-declared field.
// `download_url` is short-lived (valid for the current tool call only);
// `file_id` is a persistent handle if the host needs a fresh URL later.
const fileObjectSchema = z.object({
  download_url: z.string().describe("Temporary URL the host provides to fetch the file bytes"),
  file_id: z.string().describe("Persistent file identifier from the host"),
  mime_type: z.string().optional().describe("MIME type if the host knows it"),
  file_name: z.string().optional().describe("Original file name if the host knows it"),
});

const schema = z.object({
  // `file` is intentionally required — the openai/fileParams rewrite only
  // produces the expected object shape when the param is non-optional.
  file: fileObjectSchema.describe("Host-injected file object. ChatGPT's connector populates this automatically when the user attached a file or you generated one in the same chat."),
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
  // `_meta` is forwarded to `tools/list` by mcp-hosted's
  // `registerCollectionTools`. ChatGPT's connector reads
  // `openai/fileParams` and rewrites the named field into the host-injected
  // file object; other clients ignore it.
  _meta: { "openai/fileParams": ["file"] },
  handler: (async (model: Params) => {
    try {
      const { name: actualName, id } = await streamingUploadFromUrl({
        sourceUrl: model.file.download_url,
        name: model.name,
        mediaTypeName: model.mediaTypeName,
        parentId: model.parentId,
      });
      return createToolResult({
        message: `Media "${actualName}" created successfully`,
        name: actualName,
        id,
      });
    } catch (error) {
      return createToolResultError({
        detail: `Error creating media: ${(error as Error).message}`,
      });
    }
  }),
} satisfies ToolDefinition<typeof schema.shape, typeof createMediaFromFileOutputSchema.shape>;

// Intentionally NOT wrapped in `withStandardDecorators`: the input-sanitisation
// decorator coerces unknown object shapes in ways that interact badly with
// ChatGPT's openai/fileParams rewrite. We accept the file object verbatim
// from the connector and rely on Zod for validation.
export default tool;
