const FILE_PATH_ENTRY = `filePath - Most efficient for local files, works with any size
     SECURITY: Requires UMBRACO_ALLOWED_MEDIA_PATHS environment variable
     to be configured with comma-separated allowed directories.
     Example: UMBRACO_ALLOWED_MEDIA_PATHS="/tmp/uploads,/var/media"`;

/**
 * Builds the numbered source-types section for tool descriptions.
 * @param allowFilePath - whether filePath is available in this runtime
 * @param otherSources - additional source labels in display order (after filePath when present)
 */
export function buildSourceTypeSection(allowFilePath: boolean, otherSources: string[]): string {
  const sources = allowFilePath ? [FILE_PATH_ENTRY, ...otherSources] : otherSources;
  return sources.map((s, i) => `  ${i + 1}. ${s}`).join('\n');
}
