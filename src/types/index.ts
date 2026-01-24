/**
 * PDF File types and interfaces
 */

export interface PDFFileInfo {
    id: string;
    file: File;
    name: string;
    size: number;
    pageCount: number;
    thumbnailUrl: string | null;
    isLoading: boolean;
    error: string | null;
    arrayBuffer: ArrayBuffer | null;
}

export interface PDFPage {
    id: string;
    fileId: string;
    pageIndex: number;
    thumbnailUrl: string | null;
    isSelected: boolean;
}

export interface MergeProgress {
    status: 'idle' | 'loading' | 'merging' | 'complete' | 'error';
    progress: number;
    message: string;
}

export interface WorkerMessage {
    type: 'merge' | 'thumbnail' | 'pageCount';
    payload: unknown;
}

export interface MergeWorkerInput {
    files: {
        id: string;
        buffer: ArrayBuffer;
        name: string;
    }[];
    pageOrder?: { fileId: string; pageIndex: number }[];
}

export interface MergeWorkerOutput {
    success: boolean;
    data?: ArrayBuffer;
    error?: string;
}

export interface ThumbnailWorkerInput {
    buffer: ArrayBuffer;
    pageIndex: number;
    scale: number;
}

export interface ThumbnailWorkerOutput {
    success: boolean;
    imageData?: ImageData;
    width?: number;
    height?: number;
    error?: string;
}

export interface PageCountWorkerInput {
    buffer: ArrayBuffer;
}

export interface PageCountWorkerOutput {
    success: boolean;
    pageCount?: number;
    error?: string;
}

// App settings
export interface AppSettings {
    thumbnailQuality: 'low' | 'medium' | 'high';
    showPageNumbers: boolean;
    autoMerge: boolean;
    darkMode: boolean;
}

// Drag and drop types
export interface DragItem {
    id: string;
    type: 'file' | 'page';
    index: number;
}
