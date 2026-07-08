import * as fs from "fs";
import * as path from "path";
import mime from "mime-types";
import { validateFilePath } from "./validate-file-path.js";
import {
  CAPTURE_RAW_HTTP_RESPONSE,
  MEDIA_TYPE_IMAGE,
  MEDIA_TYPE_VECTOR_GRAPHICS,
  STANDARD_MEDIA_TYPES,
  detectFileExtensionFromBuffer,
} from "@umbraco-cms/mcp-server-sdk";

/** Hard ceiling on decoded base64 uploads. Larger files must use sourceType
 *  "url" (public direct-download URL) or "file" (host-attached chat file). */
export const BASE64_MAX_BYTES = 10 * 1024;

/**
 * Maps MIME types to file extensions using the mime-types library.
 * Returns undefined if MIME type is unknown.
 */
function getExtensionFromMimeType(mimeType: string | undefined): string | undefined {
  if (!mimeType) return undefined;

  // Remove charset and other parameters, then get extension
  const baseMimeType = mimeType.split(';')[0].trim();
  const extension = mime.extension(baseMimeType);

  return extension ? `.${extension}` : undefined;
}

/**
 * Validates and corrects media type for SVG files.
 * SVG files should use "Vector Graphics (SVG)" media type, not "Image".
 */
export function validateMediaTypeForSvg(
  filePath: string | undefined,
  fileUrl: string | undefined,
  fileName: string,
  mediaTypeName: string
): string {
  // Check if any of the file identifiers end with .svg
  const isSvg =
    filePath?.toLowerCase().endsWith('.svg') ||
    fileUrl?.toLowerCase().endsWith('.svg') ||
    fileName.toLowerCase().endsWith('.svg');

  if (isSvg && mediaTypeName === MEDIA_TYPE_IMAGE) {
    console.warn(`SVG detected - using ${MEDIA_TYPE_VECTOR_GRAPHICS} media type instead of ${MEDIA_TYPE_IMAGE}`);
    return MEDIA_TYPE_VECTOR_GRAPHICS;
  }

  return mediaTypeName;
}

/**
 * Fetches media type ID from Umbraco API by name.
 * For standard Umbraco media types, returns the hardcoded GUID immediately.
 * For custom media types, queries the API.
 * Throws error with helpful message if media type not found.
 */
export async function fetchMediaTypeId(client: any, mediaTypeName: string): Promise<string> {
  // Check if this is a standard media type (case-insensitive)
  const standardTypeKey = Object.keys(STANDARD_MEDIA_TYPES).find(
    key => key.toLowerCase() === mediaTypeName.toLowerCase()
  );

  if (standardTypeKey) {
    return STANDARD_MEDIA_TYPES[standardTypeKey];
  }

  // Fall back to API search for custom media types
  const response = await client.getItemMediaTypeSearch({ query: mediaTypeName });

  const mediaType = response.items.find(
    (mt: any) => mt.name.toLowerCase() === mediaTypeName.toLowerCase()
  );

  if (!mediaType) {
    const availableTypes = response.items.map((mt: any) => mt.name).join(', ');
    throw new Error(
      `Media type '${mediaTypeName}' not found. Available types: ${availableTypes || 'None found'}`
    );
  }

  return mediaType.id;
}

/**
 * Gets the appropriate editor alias based on media type.
 * Image uses ImageCropper, everything else uses UploadField.
 */
export function getEditorAlias(mediaTypeName: string): string {
  return mediaTypeName === MEDIA_TYPE_IMAGE ? 'Umbraco.ImageCropper' : 'Umbraco.UploadField';
}

/**
 * Builds the value structure for media creation based on media type.
 * Image media type requires crops and focal point, others just need temporaryFileId.
 */
export function buildValueStructure(mediaTypeName: string, temporaryFileId: string) {
  const base = {
    alias: "umbracoFile",
    editorAlias: getEditorAlias(mediaTypeName),
    entityType: "media-property-value",
  };

  if (mediaTypeName === MEDIA_TYPE_IMAGE) {
    return {
      ...base,
      value: {
        crops: [],
        culture: null,
        segment: null,
        focalPoint: {
          top: 0.5,
          right: 0.5,
        },
        temporaryFileId
      }
    };
  }

  return {
    ...base,
    value: { temporaryFileId }
  };
}

/**
 * Builds the upload payload for `postTemporaryFile` based on source type.
 *
 * Returns a Buffer (or a Node ReadStream for the local filePath branch) plus
 * a filename. We deliberately avoid `os.tmpdir()` + `fs.writeFileSync` because
 * Cloudflare Workers' unenv polyfill doesn't implement `fs.writeFileSync`.
 *
 * Exported for testing.
 */
export async function createFilePayload(
  sourceType: "filePath" | "url" | "base64",
  filePath: string | undefined,
  fileUrl: string | undefined,
  fileAsBase64: string | undefined,
  fileName: string
): Promise<{ data: Buffer | fs.ReadStream; filename: string }> {
  switch (sourceType) {
    case "filePath": {
      if (!filePath) {
        throw new Error("filePath is required when sourceType is 'filePath'");
      }
      // filePath is Node-only by definition — it reads from the local
      // filesystem. On Cloudflare Workers (and any non-Node runtime),
      // fs.createReadStream isn't implemented; reject up-front with a
      // clear message rather than crashing somewhere deeper.
      if (typeof fs.createReadStream !== "function") {
        throw new Error(
          "filePath source is not supported in this runtime (no filesystem). " +
          "Use sourceType 'url' or 'base64' instead."
        );
      }
      const validatedPath = await validateFilePath(filePath);

      // Umbraco's TemporaryFileService parses the extension from the upload
      // filename and crashes if it's missing. If the user-supplied `name` has
      // no extension, fall back to the on-disk filename which always does.
      const filename = fileName.includes('.') ? fileName : path.basename(validatedPath);

      return {
        data: fs.createReadStream(validatedPath),
        filename,
      };
    }

    case "url": {
      if (!fileUrl) {
        throw new Error("fileUrl is required when sourceType is 'url'");
      }
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        let response: Response;
        try {
          response = await fetch(fileUrl, { signal: controller.signal });
        } finally {
          clearTimeout(timeoutId);
        }

        if (response.status >= 400) {
          throw new Error(`Failed to fetch file from URL: HTTP ${response.status} ${response.statusText}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());

        let filename = fileName;
        if (!fileName.includes('.')) {
          const urlPath = new URL(fileUrl).pathname;
          const urlExtension = path.extname(urlPath);

          if (urlExtension) {
            filename = `${fileName}${urlExtension}`;
          } else {
            const contentType = response.headers.get('content-type') ?? undefined;
            const extensionFromMime = getExtensionFromMimeType(contentType);
            filename = extensionFromMime ? `${fileName}${extensionFromMime}` : `${fileName}.bin`;
          }
        }

        return { data: buffer, filename };
      } catch (error) {
        if ((error as any).name === 'AbortError') {
          throw new Error(`Request timeout after 30s fetching URL: ${fileUrl}`);
        }
        throw new Error(`Failed to fetch URL: ${fileUrl} - ${(error as Error).message}`);
      }
    }

    case "base64": {
      if (!fileAsBase64) {
        throw new Error("fileAsBase64 is required when sourceType is 'base64'");
      }
      // LLMs reliably truncate large base64 strings or substitute thumbnail
      // previews — both produce corrupt files. Estimate decoded size first so
      // we reject without materialising the (potentially multi-MB) buffer.
      const padding = fileAsBase64.endsWith("==") ? 2 : fileAsBase64.endsWith("=") ? 1 : 0;
      const estimatedBytes = Math.floor((fileAsBase64.length * 3) / 4) - padding;
      if (estimatedBytes > BASE64_MAX_BYTES) {
        throw new Error(
          `base64 upload rejected: decoded payload is ~${estimatedBytes.toLocaleString()} bytes ` +
          `(limit is ${BASE64_MAX_BYTES.toLocaleString()} bytes). ` +
          `Use sourceType="url" with a public direct-download URL, or sourceType="file" if the file is attached to the chat.`
        );
      }
      const buffer = Buffer.from(fileAsBase64, 'base64');

      let filename = fileName;
      if (!fileName.includes('.')) {
        const extension = detectFileExtensionFromBuffer(buffer);
        filename = `${fileName}${extension}`;
      }

      return { data: buffer, filename };
    }
  }
}

/**
 * Uploads media file to Umbraco.
 * Handles the complete workflow: file stream creation, temporary file upload, and media creation.
 * Returns the media item name and ID.
 */
export async function uploadMediaFile(
  client: any,
  params: {
    sourceType: "filePath" | "url" | "base64";
    name: string;
    mediaTypeName: string;
    filePath?: string;
    fileUrl?: string;
    fileAsBase64?: string;
    parentId?: string;
    temporaryFileId: string;
  }
): Promise<{name: string, id: string}> {
  // Step 1: Validate media type (SVG special case - only auto-correction we do)
  // We trust the LLM for all other media type decisions
  const validatedMediaTypeName = validateMediaTypeForSvg(
    params.filePath,
    params.fileUrl,
    params.name,
    params.mediaTypeName
  );

  // Step 2: Fetch media type ID
  const mediaTypeId = await fetchMediaTypeId(client, validatedMediaTypeName);

  // Step 3: Build the upload payload (Buffer for url/base64, ReadStream for filePath)
  const { data, filename } = await createFilePayload(
    params.sourceType,
    params.filePath,
    params.fileUrl,
    params.fileAsBase64,
    params.name
  );

  // Step 4: Upload to temporary file endpoint
  try {
    await client.postTemporaryFile({
      Id: params.temporaryFileId,
      File: data,
      FileName: filename,
    });
  } catch (error) {
    const err = error as any;
    const errorData = err.response?.data
      ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data))
      : err.message;
    throw new Error(`Failed to upload temporary file: ${err.response?.status || 'Unknown error'} - ${errorData}`);
  }

  // Step 5: Build value structure
  const valueStructure = buildValueStructure(validatedMediaTypeName, params.temporaryFileId);

  // Step 6: Create media item
  let response: any;
  try {
    response = await client.postMedia({
      mediaType: { id: mediaTypeId },
      variants: [
        {
          culture: null,
          segment: null,
          name: params.name, // Use original name provided by user
        },
      ],
      values: [valueStructure] as any,
      parent: params.parentId ? { id: params.parentId } : null,
    }, CAPTURE_RAW_HTTP_RESPONSE);
  } catch (error) {
    const err = error as any;
    throw new Error(`Failed to create media item: ${err.response?.status || 'Unknown error'} - ${JSON.stringify(err.response?.data) || err.message}`);
  }

  // Check if request was successful (status 200-299)
  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Request failed with status code ${response.status}`);
  }

  // Extract ID from Location header (standard REST pattern)
  const locationHeader = response.headers?.location || response.headers?.Location;
  if (!locationHeader) {
    throw new Error("No Location header in response - cannot determine created media ID");
  }

  // Location header format: /umbraco/management/api/v1/media/{id}
  const idMatch = locationHeader.match(/\/([a-f0-9-]{36})$/i);
  if (!idMatch) {
    throw new Error(`Could not extract ID from Location header: ${locationHeader}`);
  }

  const mediaId = idMatch[1];

  // Return the original name and the created media ID
  return { name: params.name, id: mediaId };
}
