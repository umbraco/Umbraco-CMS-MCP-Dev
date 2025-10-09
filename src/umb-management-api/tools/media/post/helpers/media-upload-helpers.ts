import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import axios from "axios";
import mime from "mime-types";
import { STANDARD_MEDIA_TYPES, MEDIA_TYPE_IMAGE, MEDIA_TYPE_VECTOR_GRAPHICS } from "@/constants/constants.js";

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
 * Creates a file stream based on source type.
 * Returns the stream and the temporary file path (if created).
 * Note: Temp files need a filename for Umbraco's string parsing to work correctly.
 * Exported for testing.
 */
export async function createFileStream(
  sourceType: "filePath" | "url" | "base64",
  filePath: string | undefined,
  fileUrl: string | undefined,
  fileAsBase64: string | undefined,
  fileName: string
): Promise<{ readStream: fs.ReadStream; tempFilePath: string | null }> {
  let tempFilePath: string | null = null;
  let readStream: fs.ReadStream;

  switch (sourceType) {
    case "filePath":
      if (!filePath) {
        throw new Error("filePath is required when sourceType is 'filePath'");
      }
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      readStream = fs.createReadStream(filePath);
      break;

    case "url":
      if (!fileUrl) {
        throw new Error("fileUrl is required when sourceType is 'url'");
      }
      try {
        const response = await axios.get(fileUrl, {
          responseType: 'arraybuffer',
          timeout: 30000,
          validateStatus: (status) => status < 500, // Don't throw on 4xx errors
        });

        if (response.status >= 400) {
          throw new Error(`Failed to fetch file from URL: HTTP ${response.status} ${response.statusText}`);
        }

        // Extract extension from URL, or try to detect from Content-Type header
        let fileNameWithExtension = fileName;
        if (!fileName.includes('.')) {
          const urlPath = new URL(fileUrl).pathname;
          const urlExtension = path.extname(urlPath);

          if (urlExtension) {
            // Use extension from URL
            fileNameWithExtension = `${fileName}${urlExtension}`;
          } else {
            // Try to detect extension from Content-Type header
            const contentType = response.headers['content-type'] as string | undefined;
            const extensionFromMime = getExtensionFromMimeType(contentType);
            if (extensionFromMime) {
              fileNameWithExtension = `${fileName}${extensionFromMime}`;
            } else {
              // Default to .bin if we can't determine the type
              fileNameWithExtension = `${fileName}.bin`;
            }
          }
        }

        // Use the filename with extension so Umbraco can parse it correctly
        tempFilePath = path.join(os.tmpdir(), fileNameWithExtension);
        fs.writeFileSync(tempFilePath, response.data);
        readStream = fs.createReadStream(tempFilePath);
      } catch (error) {
        const axiosError = error as any;
        if (axiosError.response) {
          throw new Error(`Failed to fetch URL: HTTP ${axiosError.response.status} - ${axiosError.response.statusText} (${fileUrl})`);
        } else if (axiosError.code === 'ECONNABORTED') {
          throw new Error(`Request timeout after 30s fetching URL: ${fileUrl}`);
        } else if (axiosError.code) {
          throw new Error(`Network error (${axiosError.code}) fetching URL: ${fileUrl} - ${axiosError.message}`);
        }
        throw new Error(`Failed to fetch URL: ${fileUrl} - ${(error as Error).message}`);
      }
      break;

    case "base64":
      if (!fileAsBase64) {
        throw new Error("fileAsBase64 is required when sourceType is 'base64'");
      }
      const fileContent = Buffer.from(fileAsBase64, 'base64');
      // Use just the filename so Umbraco can parse it correctly
      tempFilePath = path.join(os.tmpdir(), fileName);
      fs.writeFileSync(tempFilePath, fileContent);
      readStream = fs.createReadStream(tempFilePath);
      break;
  }

  return { readStream, tempFilePath };
}

/**
 * Cleans up a temporary file if it exists.
 */
export function cleanupTempFile(tempFilePath: string | null): void {
  if (tempFilePath && fs.existsSync(tempFilePath)) {
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {
      console.error('Failed to cleanup temp file:', e);
    }
  }
}

/**
 * Uploads media file to Umbraco.
 * Handles the complete workflow: file stream creation, temporary file upload, and media creation.
 * Returns the actual name used (with extension if added from URL).
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
): Promise<string> {
  let tempFilePath: string | null = null;

  try {
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

    // Step 3: Create file stream
    const { readStream, tempFilePath: createdTempPath } = await createFileStream(
      params.sourceType,
      params.filePath,
      params.fileUrl,
      params.fileAsBase64,
      params.name
    );
    tempFilePath = createdTempPath;

    // Step 4: Upload to temporary file endpoint
    try {
      await client.postTemporaryFile({
        Id: params.temporaryFileId,
        File: readStream,
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
    try {
      await client.postMedia({
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
      });
    } catch (error) {
      const err = error as any;
      throw new Error(`Failed to create media item: ${err.response?.status || 'Unknown error'} - ${JSON.stringify(err.response?.data) || err.message}`);
    }

    // Return the original name (not the temp filename with extension)
    return params.name;
  } finally {
    cleanupTempFile(tempFilePath);
  }
}
