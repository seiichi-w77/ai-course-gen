/**
 * File download utility with progress tracking
 * @module lib/download
 */

/**
 * Download a file from a URL with progress tracking
 *
 * @param url - The URL of the file to download
 * @param filename - The name to save the file as
 * @param onProgress - Optional callback for progress updates (0-100)
 * @throws {Error} If the fetch request fails or response is not OK
 *
 * @example
 * ```typescript
 * await downloadFile(
 *   'https://example.com/file.pdf',
 *   'document.pdf',
 *   (progress) => console.log(`${progress}% complete`)
 * );
 * ```
 */
export async function downloadFile(
  url: string,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  try {
    // Fetch the file
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the total file size from headers
    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    // Check if we can track progress
    const canTrackProgress = total > 0 && response.body;

    if (!canTrackProgress) {
      // Fallback: download without progress tracking
      const blob = await response.blob();
      triggerDownload(blob, filename);
      onProgress?.(100);
      return;
    }

    // Stream the response with progress tracking
    const reader = response.body!.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    // Read the stream
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      received += value.length;

      // Calculate and report progress
      const progress = Math.round((received / total) * 100);
      onProgress?.(progress);
    }

    // Combine chunks into a single Uint8Array
    const allChunks = new Uint8Array(received);
    let position = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }

    // Create blob and trigger download
    const blob = new Blob([allChunks]);
    triggerDownload(blob, filename);

  } catch (error) {
    throw new Error(
      `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Trigger browser download for a Blob
 *
 * @param blob - The Blob to download
 * @param filename - The filename to save as
 * @internal
 */
function triggerDownload(blob: Blob, filename: string): void {
  // Create object URL
  const url = URL.createObjectURL(blob);

  // Create temporary anchor element
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';

  // Append to body, click, and remove
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  // Clean up object URL after a short delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Validate if a URL is safe to download from
 *
 * @param url - The URL to validate
 * @returns True if the URL is valid and safe
 *
 * @example
 * ```typescript
 * if (isValidDownloadUrl('https://example.com/file.pdf')) {
 *   await downloadFile(url, 'file.pdf');
 * }
 * ```
 */
export function isValidDownloadUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow http/https protocols
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Format bytes to human-readable string
 *
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1.5 MB")
 *
 * @example
 * ```typescript
 * formatBytes(1536000); // "1.46 MB"
 * ```
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
