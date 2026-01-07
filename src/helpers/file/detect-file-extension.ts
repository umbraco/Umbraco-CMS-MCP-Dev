/**
 * Detects file extension from buffer magic bytes.
 * Supports common file types for media and temporary file uploads.
 *
 * @param buffer - The file buffer to analyze
 * @returns The file extension (including the leading dot), or '.bin' if unknown
 *
 * @example
 * ```typescript
 * const buffer = fs.readFileSync('image.png');
 * const extension = detectFileExtensionFromBuffer(buffer);
 * console.log(extension); // '.png'
 * ```
 */
export function detectFileExtensionFromBuffer(buffer: Buffer): string {
  if (buffer.length === 0) return '.bin';

  // Check magic bytes for common file types

  // PNG: 89 50 4E 47
  if (buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return '.png';
  }

  // JPEG: FF D8
  if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xD8) {
    return '.jpg';
  }

  // GIF: 47 49 46
  if (buffer.length >= 3 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return '.gif';
  }

  // WebP: Check for "WEBP" at offset 8
  if (buffer.length >= 12 && buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return '.webp';
  }

  // SVG: XML-based, look for "<svg" or "<?xml" with "svg"
  const start = buffer.toString('utf8', 0, Math.min(100, buffer.length)).toLowerCase();
  if (start.includes('<svg') || (start.includes('<?xml') && start.includes('svg'))) {
    return '.svg';
  }

  // PDF: 25 50 44 46
  if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return '.pdf';
  }

  // MP4: Check for "ftyp" at offset 4
  if (buffer.length >= 12 && buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    return '.mp4';
  }

  // Default to .bin if unknown
  return '.bin';
}
