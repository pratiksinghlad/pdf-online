export interface EncryptFileInfo {
    id: string;
    file: File;
    name: string;
    size: number;
    password?: string;
    status: 'idle' | 'processing' | 'success' | 'error';
    processedBuffer?: ArrayBuffer;
    error?: string;
}

export interface EncryptWorkerInput {
    id: string;
    buffer: ArrayBuffer;
    password?: string;
}

export interface EncryptWorkerOutput {
    id: string;
    success: boolean;
    data?: ArrayBuffer;
    error?: string;
}
