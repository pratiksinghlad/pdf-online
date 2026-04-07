export interface UnlockFileInfo {
    id: string;
    file: File;
    name: string;
    size: number;
    password?: string;
    status: 'idle' | 'processing' | 'success' | 'error' | 'not-protected';
    processedBuffer?: ArrayBuffer;
    error?: string;
}

export interface UnlockWorkerInput {
    id: string;
    buffer: ArrayBuffer;
    password?: string;
}

export interface UnlockWorkerOutput {
    id: string;
    success: boolean;
    data?: ArrayBuffer;
    isEncrypted?: boolean;
    error?: string;
}
