import * as path from "path";
import * as fs from "fs";
import { getServerConfig } from "@umbraco-cms/mcp-server-sdk";

/**
 * Validates file path is within allowed directories (UMBRACO_ALLOWED_MEDIA_PATHS).
 * Prevents path traversal attacks and validates symlink targets.
 * Exported for testing.
 */
export function validateFilePath(filePath: string, allowedPaths?: string[]): string {
  // Get configuration (in stdio mode, this won't log) or use provided paths
  const allowedMediaPaths = allowedPaths ?? getServerConfig(true).config.allowedMediaPaths;

  // Check if UMBRACO_ALLOWED_MEDIA_PATHS is configured
  if (!allowedMediaPaths || allowedMediaPaths.length === 0) {
    throw new Error(
      "File path uploads are disabled. To enable, set UMBRACO_ALLOWED_MEDIA_PATHS environment variable " +
      "with comma-separated allowed directory paths (e.g., UMBRACO_ALLOWED_MEDIA_PATHS=\"/tmp/uploads,/var/media\")"
    );
  }

  // Normalize the requested path to absolute form
  // This prevents path traversal attacks like "../../../etc/passwd"
  const normalizedPath = path.resolve(filePath);

  // Check if the normalized path starts with any of the allowed directories
  const isAllowed = allowedMediaPaths.some((allowedPath: string) => {
    // Ensure we're comparing normalized paths
    // Use realpath for comparison to handle symlinks in the path itself (e.g., /tmp -> /private/tmp on macOS)
    const realAllowedPath = fs.realpathSync(allowedPath);
    return normalizedPath.startsWith(allowedPath) || normalizedPath.startsWith(realAllowedPath);
  });

  if (!isAllowed) {
    throw new Error(
      `File path "${filePath}" is not in an allowed directory. ` +
      `Allowed directories: ${allowedMediaPaths.join(", ")}`
    );
  }

  // Additional security check: verify the file exists and is a real file (not a symlink to outside allowed paths)
  try {
    const stats = fs.lstatSync(normalizedPath);

    if (stats.isSymbolicLink()) {
      // Resolve the symlink and verify it's also within allowed paths
      const realPath = fs.realpathSync(normalizedPath);
      const symlinkAllowed = allowedMediaPaths.some((allowedPath: string) => {
        // Use realpath for comparison to handle symlinks in paths (e.g., /tmp -> /private/tmp on macOS)
        const realAllowedPath = fs.realpathSync(allowedPath);
        return realPath.startsWith(allowedPath) || realPath.startsWith(realAllowedPath);
      });

      if (!symlinkAllowed) {
        throw new Error(
          `File path "${filePath}" is a symbolic link to "${realPath}" which is outside allowed directories`
        );
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist - let the caller handle this error
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }

  return normalizedPath;
}
