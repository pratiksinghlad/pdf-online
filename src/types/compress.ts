/**
 * Types for PDF Compression feature
 */

export type CompressionLevel = 'basic' | 'strong';

export interface CompressionOptions {
    level: CompressionLevel;
    removeMetadata: boolean;
    flattenAnnotations: boolean;
}

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

export interface CompressionProgress {
    status: 'idle' | 'loading' | 'compressing' | 'complete' | 'error';
    progress: number;
    message: string;
    currentFileIndex: number;
    totalFiles: number;
}

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
