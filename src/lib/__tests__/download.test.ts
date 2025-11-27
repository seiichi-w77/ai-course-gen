import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadFile, isValidDownloadUrl, formatBytes } from '../download';

// Mock global fetch
global.fetch = vi.fn();

describe('Download Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock document methods for browser environment
    global.document = {
      createElement: vi.fn().mockReturnValue({
        click: vi.fn(),
        style: {},
      }),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    } as any;

    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('downloadFile', () => {
    it('should download file successfully with progress tracking', async () => {
      const mockBlob = new Blob(['test content'], { type: 'text/plain' });
      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({ done: false, value: new Uint8Array([1, 2, 3]) })
          .mockResolvedValueOnce({ done: false, value: new Uint8Array([4, 5]) })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      const mockResponse = {
        ok: true,
        headers: new Map([['content-length', '5']]),
        body: {
          getReader: () => mockReader,
        },
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const progressCallback = vi.fn();

      await downloadFile('https://example.com/file.pdf', 'document.pdf', progressCallback);

      // Should have called fetch
      expect(fetch).toHaveBeenCalledWith('https://example.com/file.pdf');

      // Should have tracked progress
      expect(progressCallback).toHaveBeenCalled();
      expect(progressCallback.mock.calls.length).toBeGreaterThan(0);

      // Should have created download link
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should download file without progress tracking when content-length is missing', async () => {
      const mockBlob = new Blob(['test content'], { type: 'text/plain' });
      const mockResponse = {
        ok: true,
        headers: new Map(),
        blob: vi.fn().mockResolvedValue(mockBlob),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const progressCallback = vi.fn();

      await downloadFile('https://example.com/file.pdf', 'document.pdf', progressCallback);

      expect(fetch).toHaveBeenCalled();
      expect(mockResponse.blob).toHaveBeenCalled();
      expect(progressCallback).toHaveBeenCalledWith(100);
    });

    it('should download file without progress tracking when body is null', async () => {
      const mockBlob = new Blob(['test content'], { type: 'text/plain' });
      const mockResponse = {
        ok: true,
        headers: new Map([['content-length', '100']]),
        body: null,
        blob: vi.fn().mockResolvedValue(mockBlob),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const progressCallback = vi.fn();

      await downloadFile('https://example.com/file.pdf', 'document.pdf', progressCallback);

      expect(mockResponse.blob).toHaveBeenCalled();
      expect(progressCallback).toHaveBeenCalledWith(100);
    });

    it('should work without progress callback', async () => {
      const mockBlob = new Blob(['test content'], { type: 'text/plain' });
      const mockResponse = {
        ok: true,
        headers: new Map(),
        blob: vi.fn().mockResolvedValue(mockBlob),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await downloadFile('https://example.com/file.pdf', 'document.pdf');

      expect(fetch).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should throw error for HTTP error status', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await expect(
        downloadFile('https://example.com/file.pdf', 'document.pdf')
      ).rejects.toThrow('HTTP error! status: 404');
    });

    it('should throw error when fetch fails', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      await expect(
        downloadFile('https://example.com/file.pdf', 'document.pdf')
      ).rejects.toThrow('Download failed: Network error');
    });

    it('should trigger browser download with correct filename', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/plain' });
      const mockResponse = {
        ok: true,
        headers: new Map(),
        blob: vi.fn().mockResolvedValue(mockBlob),
      };

      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
        style: {},
      };

      vi.mocked(document.createElement).mockReturnValue(mockAnchor as any);
      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await downloadFile('https://example.com/file.pdf', 'my-document.pdf');

      expect(mockAnchor.download).toBe('my-document.pdf');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchor);
    });

    it('should clean up object URL after download', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/plain' });
      const mockResponse = {
        ok: true,
        headers: new Map(),
        blob: vi.fn().mockResolvedValue(mockBlob),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await downloadFile('https://example.com/file.pdf', 'document.pdf');

      // Wait for cleanup timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should report progress correctly', async () => {
      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({ done: false, value: new Uint8Array(50) }) // 50 bytes
          .mockResolvedValueOnce({ done: false, value: new Uint8Array(50) }) // 100 bytes total
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      const mockResponse = {
        ok: true,
        headers: new Map([['content-length', '100']]),
        body: {
          getReader: () => mockReader,
        },
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const progressCallback = vi.fn();

      await downloadFile('https://example.com/file.pdf', 'document.pdf', progressCallback);

      // Should report 50% and 100%
      expect(progressCallback).toHaveBeenCalledWith(50);
      expect(progressCallback).toHaveBeenCalledWith(100);
    });

    it('should handle large files with multiple chunks', async () => {
      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({ done: false, value: new Uint8Array(100) })
          .mockResolvedValueOnce({ done: false, value: new Uint8Array(100) })
          .mockResolvedValueOnce({ done: false, value: new Uint8Array(100) })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      };

      const mockResponse = {
        ok: true,
        headers: new Map([['content-length', '300']]),
        body: {
          getReader: () => mockReader,
        },
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const progressCallback = vi.fn();

      await downloadFile('https://example.com/file.pdf', 'document.pdf', progressCallback);

      expect(progressCallback).toHaveBeenCalledWith(33); // 100/300
      expect(progressCallback).toHaveBeenCalledWith(67); // 200/300
      expect(progressCallback).toHaveBeenCalledWith(100); // 300/300
    });
  });

  describe('isValidDownloadUrl', () => {
    it('should return true for valid HTTP URL', () => {
      expect(isValidDownloadUrl('http://example.com/file.pdf')).toBe(true);
    });

    it('should return true for valid HTTPS URL', () => {
      expect(isValidDownloadUrl('https://example.com/file.pdf')).toBe(true);
    });

    it('should return false for invalid URL', () => {
      expect(isValidDownloadUrl('not a url')).toBe(false);
    });

    it('should return false for file:// protocol', () => {
      expect(isValidDownloadUrl('file:///path/to/file.pdf')).toBe(false);
    });

    it('should return false for ftp:// protocol', () => {
      expect(isValidDownloadUrl('ftp://example.com/file.pdf')).toBe(false);
    });

    it('should return false for data: URL', () => {
      expect(isValidDownloadUrl('data:text/plain;base64,SGVsbG8=')).toBe(false);
    });

    it('should return false for javascript: URL', () => {
      expect(isValidDownloadUrl('javascript:alert(1)')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidDownloadUrl('')).toBe(false);
    });

    it('should return true for URL with query parameters', () => {
      expect(isValidDownloadUrl('https://example.com/file.pdf?token=123')).toBe(true);
    });

    it('should return true for URL with fragment', () => {
      expect(isValidDownloadUrl('https://example.com/file.pdf#page=2')).toBe(true);
    });

    it('should return true for URL with port', () => {
      expect(isValidDownloadUrl('https://example.com:8080/file.pdf')).toBe(true);
    });

    it('should return true for localhost URL', () => {
      expect(isValidDownloadUrl('http://localhost:3000/file.pdf')).toBe(true);
    });

    it('should return true for IP address URL', () => {
      expect(isValidDownloadUrl('http://192.168.1.1/file.pdf')).toBe(true);
    });
  });

  describe('formatBytes', () => {
    it('should format 0 bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('should format bytes (< 1024)', () => {
      expect(formatBytes(100)).toBe('100 Bytes');
      expect(formatBytes(1023)).toBe('1023 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(2048)).toBe('2 KB');
    });

    it('should format megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB'); // 1024 * 1024
      expect(formatBytes(1572864)).toBe('1.5 MB'); // 1.5 * 1024 * 1024
      expect(formatBytes(5242880)).toBe('5 MB'); // 5 * 1024 * 1024
    });

    it('should format gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1 GB'); // 1024^3
      expect(formatBytes(2147483648)).toBe('2 GB'); // 2 * 1024^3
    });

    it('should format terabytes', () => {
      expect(formatBytes(1099511627776)).toBe('1 TB'); // 1024^4
    });

    it('should respect custom decimal places', () => {
      expect(formatBytes(1536, 0)).toBe('2 KB');
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
      expect(formatBytes(1536, 3)).toBe('1.500 KB');
    });

    it('should handle negative decimal places', () => {
      expect(formatBytes(1536, -1)).toBe('2 KB');
    });

    it('should format exact powers of 1024', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    it('should format large file sizes', () => {
      expect(formatBytes(123456789)).toBe('117.74 MB');
      expect(formatBytes(9876543210)).toBe('9.2 GB');
    });

    it('should format small decimal values correctly', () => {
      expect(formatBytes(1500)).toBe('1.46 KB');
      expect(formatBytes(2500)).toBe('2.44 KB');
    });

    it('should use default 2 decimal places when not specified', () => {
      const result = formatBytes(1536000);
      expect(result).toBe('1.46 MB');
      // Should have at most 2 decimal places
      const decimalPart = result.split('.')[1]?.split(' ')[0] || '';
      expect(decimalPart.length).toBeLessThanOrEqual(2);
    });
  });
});
