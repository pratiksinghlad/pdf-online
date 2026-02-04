/**
 * Image to PDF types and interfaces
 */

export interface ImageFileInfo {
    id: string;
    file: File;
    name: string;
    size: number;
    width: number;
    height: number;
    thumbnailUrl: string | null;
    previewUrl: string | null;
    isLoading: boolean;
    error: string | null;
}

export interface ConvertProgress {
    status: 'idle' | 'loading' | 'converting' | 'complete' | 'error';
    progress: number;
    message: string;
}

export interface ImageToPDFOptions {
    pageSize: 'A4' | 'Letter' | 'Original';
    orientation: 'auto' | 'portrait' | 'landscape';
    margin: number; // in mm
    imageQuality: number; // 0-1
}
