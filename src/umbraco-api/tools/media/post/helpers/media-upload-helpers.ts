import * as fs from "fs";
import * as path from "path";
import mime from "mime-types";
import { validateFilePath } from "./validate-file-path.js";
import {
  CAPTURE_RAW_HTTP_RESPONSE,
  MEDIA_TYPE_ALIASES,
  MEDIA_TYPE_ARTICLE,
  MEDIA_TYPE_AUDIO,
  MEDIA_TYPE_FILE,
  MEDIA_TYPE_IMAGE,
  MEDIA_TYPE_VECTOR_GRAPHICS,
  MEDIA_TYPE_VIDEO,
  detectFileExtensionFromBuffer,
  resolveMediaTypeId,
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
 *
 * Returns the requested name only; the id is resolved by `fetchMediaTypeId`,
 * which falls back to `File` when the site has no Vector Graphics media type.
 * So the full chain for an SVG requested as Image is: Vector Graphics, then File.
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

  if (isSvg && mediaTypeName.toLowerCase() === MEDIA_TYPE_IMAGE.toLowerCase()) {
    console.warn(`SVG detected - using ${MEDIA_TYPE_VECTOR_GRAPHICS} media type instead of ${MEDIA_TYPE_IMAGE}`);
    return MEDIA_TYPE_VECTOR_GRAPHICS;
  }

  return mediaTypeName;
}

/**
 * Built-in media type names the tools accept, keyed by lower-cased name, with
 * the alias used to resolve the site's id and whether a missing type falls
 * back to File. Video, Audio, Article and Vector Graphics were only seeded on
 * fresh installs from Umbraco 8.14 and no migration adds them, so older sites
 * may not have them.
 */
const BUILT_IN_MEDIA_TYPES: Record<string, { name: string; alias: string; fallbackToFile: boolean }> = {
  [MEDIA_TYPE_IMAGE.toLowerCase()]: { name: MEDIA_TYPE_IMAGE, alias: MEDIA_TYPE_ALIASES.Image, fallbackToFile: false },
  [MEDIA_TYPE_FILE.toLowerCase()]: { name: MEDIA_TYPE_FILE, alias: MEDIA_TYPE_ALIASES.File, fallbackToFile: false },
  [MEDIA_TYPE_VIDEO.toLowerCase()]: { name: MEDIA_TYPE_VIDEO, alias: MEDIA_TYPE_ALIASES.Video, fallbackToFile: true },
  [MEDIA_TYPE_AUDIO.toLowerCase()]: { name: MEDIA_TYPE_AUDIO, alias: MEDIA_TYPE_ALIASES.Audio, fallbackToFile: true },
  [MEDIA_TYPE_ARTICLE.toLowerCase()]: { name: MEDIA_TYPE_ARTICLE, alias: MEDIA_TYPE_ALIASES.Article, fallbackToFile: true },
  [MEDIA_TYPE_VECTOR_GRAPHICS.toLowerCase()]: { name: MEDIA_TYPE_VECTOR_GRAPHICS, alias: MEDIA_TYPE_ALIASES.VectorGraphics, fallbackToFile: true },
};

/** The media type an upload will actually use. */
export type ResolvedMediaType = {
  /** Media type id on the connected site. */
  id: string;
  /**
   * Name of the media type actually used. Can differ from the requested name
   * for three reasons: a built-in type's canonical casing is substituted
   * regardless of the casing requested (e.g. `image` → `Image`); a custom
   * type's name is taken from the search result rather than the query; or a
   * missing built-in type fell back to File. Drives the editor alias and value
   * shape (see `buildValueStructure`) — always use this value, never the
   * originally requested string.
   */
  name: string;
};

/** What an upload created, plus the media type it was created as. */
export type MediaUploadResult = {
  /** Media item name, as provided by the caller. */
  name: string;
  /** Id of the created media item. */
  id: string;
  /** Name of the media type actually used (`ResolvedMediaType.name`). */
  mediaTypeName: string;
  /**
   * The requested media type name, set only when the site doesn't have it and
   * `mediaTypeName` was used instead (e.g. Video on a site installed before
   * Umbraco 8.14 falls back to File). Undefined when the requested type was used.
   */
  substitutedFor?: string;
};

/**
 * Returns the requested name when a different media type was used, else
 * undefined. Case-insensitive, so canonical casing of a built-in or custom
 * type name is not reported as a substitution; the only remaining cause of a
 * difference is the File fallback in `fetchMediaTypeId`.
 *
 * `requestedName` is the name after SVG auto-correction
 * (`validateMediaTypeForSvg`), since that is what was looked up.
 */
export function getSubstitutedMediaType(
  requestedName: string,
  resolved: ResolvedMediaType
): string | undefined {
  return requestedName.toLowerCase() === resolved.name.toLowerCase() ? undefined : requestedName;
}

/** Warning for the tool result when a different media type was used, else undefined. */
export function getMediaTypeWarning(result: MediaUploadResult): string | undefined {
  return result.substitutedFor
    ? `This site has no '${result.substitutedFor}' media type, so '${result.mediaTypeName}' was used instead.`
    : undefined;
}

/** Success message for a created media item, mentioning any media type substitution. */
export function formatMediaCreatedMessage(result: MediaUploadResult): string {
  return result.substitutedFor
    ? `Media "${result.name}" created as '${result.mediaTypeName}' — this site has no '${result.substitutedFor}' media type.`
    : `Media "${result.name}" created successfully`;
}

/**
 * Resolves the media type to use for an upload on the connected site.
 *
 * Built-in types (Image, File, Video, Audio, Article, SVG) are looked up by
 * alias with `resolveMediaTypeId`, never by fresh-install key, since upgraded
 * sites carry different keys. Video, Audio, Article and SVG fall back to File
 * when the site doesn't have them. Custom media types are found by name.
 * Throws with a helpful message if no media type can be found.
 */
export async function fetchMediaTypeId(client: any, mediaTypeName: string): Promise<ResolvedMediaType> {
  const builtIn = BUILT_IN_MEDIA_TYPES[mediaTypeName.toLowerCase()];

  if (builtIn) {
    const id = await resolveMediaTypeId(builtIn.alias);
    if (id) {
      return { id, name: builtIn.name };
    }

    if (builtIn.fallbackToFile) {
      const fileId = await resolveMediaTypeId(MEDIA_TYPE_ALIASES.File);
      if (fileId) {
        console.warn(`Media type '${builtIn.name}' not found on this site - using ${MEDIA_TYPE_FILE} instead`);
        return { id: fileId, name: MEDIA_TYPE_FILE };
      }
    }

    throw new Error(
      `Media type '${builtIn.name}' (alias '${builtIn.alias}') not found on this site` +
      (builtIn.fallbackToFile ? `, and no '${MEDIA_TYPE_FILE}' media type to fall back to` : '')
    );
  }

  // Custom media types: search by name
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

  return { id: mediaType.id, name: mediaType.name };
}

/**
 * Gets the appropriate editor alias based on media type.
 * Image uses ImageCropper, everything else uses UploadField.
 * Pass the name of the media type actually used (`ResolvedMediaType.name`).
 */
export function getEditorAlias(mediaTypeName: string): string {
  return mediaTypeName === MEDIA_TYPE_IMAGE ? 'Umbraco.ImageCropper' : 'Umbraco.UploadField';
}

/**
 * Builds the value structure for media creation based on media type.
 * Image media type requires crops and focal point, others just need temporaryFileId.
 * Pass the name of the media type actually used (`ResolvedMediaType.name`).
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
 * Returns the media item name and ID, plus the media type actually used.
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
): Promise<MediaUploadResult> {
  // Step 1: Validate media type (SVG special case - only auto-correction we do)
  // We trust the LLM for all other media type decisions
  const validatedMediaTypeName = validateMediaTypeForSvg(
    params.filePath,
    params.fileUrl,
    params.name,
    params.mediaTypeName
  );

  // Step 2: Resolve the media type on the connected site (may fall back to File)
  const mediaType = await fetchMediaTypeId(client, validatedMediaTypeName);

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

  // Step 5: Build value structure for the media type actually used
  const valueStructure = buildValueStructure(mediaType.name, params.temporaryFileId);

  // Step 6: Create media item
  let response: any;
  try {
    response = await client.postMedia({
      mediaType: { id: mediaType.id },
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

  // Return the original name, the created media ID and the media type used
  return {
    name: params.name,
    id: mediaId,
    mediaTypeName: mediaType.name,
    substitutedFor: getSubstitutedMediaType(validatedMediaTypeName, mediaType),
  };
}
