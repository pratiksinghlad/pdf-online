/**
 * Utility functions for the PDF Merger app
 */

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const isNegative = bytes < 0;
    const absoluteBytes = Math.abs(bytes);

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(absoluteBytes) / Math.log(k));

    const formattedValue = parseFloat((absoluteBytes / Math.pow(k, i)).toFixed(2));
    return (isNegative ? '-' : '') + formattedValue + ' ' + sizes[i];
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Generate a timestamped filename for the merged PDF
 */
export function generateMergedFilename(): string {
    const now = new Date();
    const timestamp = now.toISOString()
        .replace(/[:-]/g, '')
        .replace('T', '_')
        .split('.')[0];
    return `merged_pdf_${timestamp}.pdf`;
}

/**
 * Check if a file is a valid PDF
 */
export function isValidPDF(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Detect file type category based on file
 */
export function getFileCategory(file: File): 'pdf' | 'image' | 'text' | 'unknown' {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
        return 'pdf';
    }
    
    if (
        type.startsWith('image/png') || type.startsWith('image/jpeg') || type.startsWith('image/webp') ||
        name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp')
    ) {
        return 'image';
    }
    
    if (type === 'text/plain' || name.endsWith('.txt')) {
        return 'text';
    }
    
    return 'unknown';
}

/**
 * Check if a file is a valid mergeable file (PDF, Image, Text)
 */
export function isMergeableFile(file: File): boolean {
    return getFileCategory(file) !== 'unknown';
}

/**
 * Trigger a download for a blob/arraybuffer
 */
export function downloadBlob(data: ArrayBuffer | Blob, filename: string): void {
    const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

/**
 * Check browser capabilities
 */
export function getBrowserCapabilities(): {
    supportsOffscreenCanvas: boolean;
    supportsTransferableObjects: boolean;
    supportsWebWorkers: boolean;
} {
    return {
        supportsOffscreenCanvas: typeof OffscreenCanvas !== 'undefined',
        supportsTransferableObjects: typeof ArrayBuffer !== 'undefined',
        supportsWebWorkers: typeof Worker !== 'undefined',
    };
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Convert ArrayBuffer to base64
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

/**
 * Read file as ArrayBuffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Check if the application is running in Tauri
 */
export function isTauri(): boolean {
    // @ts-expect-error - __TAURI_INTERNALS__ is injected by Tauri at runtime
    return typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined;
}

/**
 * Open a URL in the external system browser if in Tauri, or a new tab if in Web
 */
export async function openExternalLink(url: string): Promise<void> {
    if (isTauri()) {
        try {
            const { open } = await import('@tauri-apps/plugin-shell');
            await open(url);
        } catch (error) {
            console.error('Failed to open external link via Tauri shell:', error);
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    } else {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}
