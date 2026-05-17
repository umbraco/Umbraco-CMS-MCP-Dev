/**
 * Create-media variant for ChatGPT proxied-file uploads.
 *
 * Declares `openai/fileParams: ["file"]` so ChatGPT's connector will upload
 * the user's sandbox file to its hosted store and pass a
 * `{ download_url, file_id, mime_type, file_name }` object instead of the
 * raw `/mnt/data/...` path (which fails with "File arg rewrite paths are
 * required when proxied mounts are present.").
 *
 * Registered directly on the McpServer in worker.ts because the SDK's
 * tool-registration loop doesn't currently forward `_meta`.
 */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { UmbracoManagementClient } from "../../../umbraco-management-client.js";
import { uploadMediaFile } from "./helpers/media-upload-helpers.js";
import {
  MEDIA_TYPE_ARTICLE,
  MEDIA_TYPE_AUDIO,
  MEDIA_TYPE_FILE,
  MEDIA_TYPE_IMAGE,
  MEDIA_TYPE_VECTOR_GRAPHICS,
  MEDIA_TYPE_VIDEO,
} from "@umbraco-cms/mcp-server-sdk";

const fileShape = {
  download_url: z.string().describe("Temporary URL provided by the host to fetch the file bytes"),
  file_id: z.string().describe("Persistent file identifier from the host"),
  mime_type: z.string().optional().describe("MIME type of the file, if known"),
  file_name: z.string().optional().describe("Original file name, if known"),
};

const inputShape = {
  file: z.object(fileShape).describe("File reference provided by the ChatGPT host (uploaded or generated)"),
  name: z.string().describe("The name of the media item"),
  mediaTypeName: z.string().describe(
    `Media type: '${MEDIA_TYPE_IMAGE}', '${MEDIA_TYPE_ARTICLE}', '${MEDIA_TYPE_AUDIO}', '${MEDIA_TYPE_VIDEO}', '${MEDIA_TYPE_VECTOR_GRAPHICS}', '${MEDIA_TYPE_FILE}', or a custom media type name`
  ),
  parentId: z.string().uuid().optional().describe("Parent folder ID (defaults to root)"),
};

const outputShape = {
  message: z.string(),
  name: z.string(),
  id: z.string().uuid(),
};

export function registerCreateMediaFromFileTool(server: McpServer): void {
  server.registerTool(
    "create-media-from-file",
    {
      description:
        "Upload a media file to Umbraco using a file reference provided by the ChatGPT host (proxied mount, generated image, or user upload). " +
        "Prefer this tool over `create-media` whenever the source is a file the user attached or that ChatGPT generated in its sandbox — " +
        "ChatGPT will host the file and pass a `{ download_url, file_id }` object on the `file` parameter.",
      inputSchema: inputShape,
      outputSchema: outputShape,
      annotations: { title: "Create media from file (ChatGPT-hosted)" },
      _meta: { "openai/fileParams": ["file"] },
    },
    async (model) => {
      try {
        const client = UmbracoManagementClient.getClient();
        const temporaryFileId = uuidv4();

        const { name: actualName, id } = await uploadMediaFile(client, {
          sourceType: "url",
          name: model.name,
          mediaTypeName: model.mediaTypeName,
          fileUrl: model.file.download_url,
          parentId: model.parentId,
          temporaryFileId,
        });

        const structured = {
          message: `Media "${actualName}" created successfully`,
          name: actualName,
          id,
        };
        return {
          content: [{ type: "text" as const, text: JSON.stringify(structured) }],
          structuredContent: structured,
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error creating media: ${(error as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
