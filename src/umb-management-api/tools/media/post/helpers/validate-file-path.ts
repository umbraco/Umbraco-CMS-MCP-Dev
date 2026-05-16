import * as path from "path";
import * as fs from "fs";

/**
 * Validates file path is within allowed directories (UMBRACO_ALLOWED_MEDIA_PATHS).
 * Prevents path traversal attacks and validates symlink targets.
 * Exported for testing.
 */
export async function validateFilePath(filePath: string, allowedPaths?: string[]): Promise<string> {
  // Read the env var directly rather than via getServerConfig — that triggers
  // CLI arg parsing (yargs dynamic import) which fails on Cloudflare Workers.
  // The filePath source is Node-only by definition (fs.createReadStream below),
  // but the env-var lookup itself must not crash on Workers.
  const allowedMediaPaths =
    allowedPaths ??
    (process.env.UMBRACO_ALLOWED_MEDIA_PATHS
      ? process.env.UMBRACO_ALLOWED_MEDIA_PATHS.split(",").map((p) => p.trim()).filter(Boolean)
      : undefined);

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

  // Check if the normalized path starts with any of the allowed directories.
  // fs.realpathSync resolves symlinks (e.g. /tmp -> /private/tmp on macOS) but
  // can throw on Workers (fs not implemented) or when the allowedPath doesn't
  // exist — fall back to literal string comparison in those cases.
  const isAllowed = allowedMediaPaths.some((allowedPath: string) => {
    if (normalizedPath.startsWith(allowedPath)) return true;
    try {
      const realAllowedPath = fs.realpathSync(allowedPath);
      return normalizedPath.startsWith(realAllowedPath);
    } catch {
      return false;
    }
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
        if (realPath.startsWith(allowedPath)) return true;
        try {
          const realAllowedPath = fs.realpathSync(allowedPath);
          return realPath.startsWith(realAllowedPath);
        } catch {
          return false;
        }
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
