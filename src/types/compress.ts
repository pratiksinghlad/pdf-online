/**
 * Types for PDF Compression feature
 * Supports Ghostscript WASM-based compression with fallback
 */

// ─── Compression Profiles ──────────────────────────────────────────────────
export type CompressionLevel = 'basic' | 'best' | 'custom';

export interface CompressionProfile {
    // ... no changes to interface needed, just values in config
    readonly name: string;
    readonly level: CompressionLevel;
    readonly description: string;
    /** Ghostscript -dPDFSETTINGS value */
    readonly gsSettings: '/screen' | '/ebook' | '/printer' | '/prepress';
    /** Target DPI for image downsampling */
    readonly dpi: number;
    /** Canvas fallback: render scale factor */
    readonly canvasScale: number;
    /** Canvas fallback: JPEG quality 0-1 */
    readonly canvasQuality: number;
}

// ─── Compression Options ────────────────────────────────────────────────────
export interface CompressionOptions {
    level: CompressionLevel;
    customDpi?: number; // Added for 'custom' level
    removeMetadata: boolean;
    flattenAnnotations: boolean;
}

// ─── File State ─────────────────────────────────────────────────────────────
export interface CompressedFileInfo {
    id: string;
    file: File;
    name: string;
    originalSize: number;
    compressedSize: number | null;
    pageCount: number;
    thumbnailUrl: string | null;
    isLoading: boolean;
    isCompressing: boolean;
    isCompressed: boolean;
    error: string | null;
    arrayBuffer: ArrayBuffer | null;
    compressedBuffer: ArrayBuffer | null;
    compressionRatio: number | null;
}

// ─── Progress ───────────────────────────────────────────────────────────────
export interface CompressionProgress {
    status: 'idle' | 'loading' | 'compressing' | 'complete' | 'error';
    progress: number;
    message: string;
    currentFileIndex: number;
    totalFiles: number;
}

// ─── Worker Messages ────────────────────────────────────────────────────────
export type CompressWorkerMessage =
    | {
          type: 'compress';
          id: string;
          payload: {
              buffer: ArrayBuffer;
              profile: CompressionLevel;
              customDpi?: number;
              removeMetadata: boolean;
          };
      }
    | {
          type: 'init';
          id: string;
      }
    | {
          /** Main thread sends back pre-rendered JPEG pages for worker to assemble */
          type: 'compress-assembled';
          id: string;
          payload: {
              jpegPages: ArrayBuffer[];
              pageDimensions: { width: number; height: number }[];
              removeMetadata: boolean;
              originalSize: number;
          };
      };

export type CompressWorkerResponse =
    | {
          type: 'progress';
          id: string;
          payload: {
              progress: number;
              message: string;
          };
      }
    | {
          type: 'result';
          id: string;
          payload: {
              success: true;
              data: ArrayBuffer;
              originalSize: number;
              compressedSize: number;
              engine: 'ghostscript' | 'canvas-fallback';
          };
      }
    | {
          type: 'error';
          id: string;
          payload: {
              success: false;
              error: string;
          };
      }
    | {
          type: 'init-result';
          id: string;
          payload: {
              ready: boolean;
              engine: 'ghostscript' | 'canvas-fallback';
              error?: string;
          };
      }
    | {
          /** Worker cannot render (no DOM) — asks main thread to render pages and send back JPEG bytes */
          type: 'needs-render';
          id: string;
          payload: {
              buffer: ArrayBuffer;
          };
      };

// ─── Legacy (kept for backward compat with pdfWorker) ───────────────────────
export interface CompressWorkerInput {
    files: {
        id: string;
        buffer: ArrayBuffer;
        name: string;
    }[];
    options: CompressionOptions;
}

export interface CompressWorkerOutput {
    success: boolean;
    data?: ArrayBuffer;
    originalSize?: number;
    compressedSize?: number;
    error?: string;
}
