/**
 * Compression Service Layer
 *
 * Orchestrates the 2-step compression protocol:
 *   1. Worker tries GS WASM — if available, done in one step.
 *   2. If not, worker sends `needs-render` → main thread renders pages to JPEG
 *      → sends `compress-assembled` back → worker packs PDF with pdf-lib.
 *
 * This keeps ALL DOM-dependent code (canvas rendering) on the main thread,
 * and ALL PDF assembly in the worker.
 */
import type { CompressionLevel, CompressWorkerResponse } from '../types/compress';
import { generateId } from '../utils';
import { getCanvasFallbackConfig } from './compressionConfig';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CompressResult {
    success: true;
    data: ArrayBuffer;
    originalSize: number;
    compressedSize: number;
    engine: 'ghostscript' | 'canvas-fallback';
}

export interface CompressError {
    success: false;
    error: string;
}

export type CompressOutcome = CompressResult | CompressError;

export interface CompressionProgressCallback {
    (progress: number, message: string): void;
}

// ─── Service ────────────────────────────────────────────────────────────────

export class CompressionService {
    private worker: Worker | null = null;
    private isReady = false;
    private engine: 'ghostscript' | 'canvas-fallback' = 'canvas-fallback';
    private pendingCallbacks = new Map<
        string,
        {
            resolve: (value: CompressOutcome) => void;
            onProgress?: CompressionProgressCallback;
            // stored so the render-and-send step can access them
            level?: CompressionLevel;
            customDpi?: number;
            removeMetadata?: boolean;
        }
    >();

    async initialize(): Promise<{ engine: 'ghostscript' | 'canvas-fallback' }> {
        if (this.isReady && this.worker) {
            return { engine: this.engine };
        }

        return new Promise((resolve, reject) => {
            try {
                this.worker = new Worker(
                    new URL('../workers/compressWorker.ts', import.meta.url),
                    { type: 'module' }
                );

                this.worker.onmessage = (event: MessageEvent<CompressWorkerResponse>) => {
                    this.handleMessage(event.data);
                };

                this.worker.onerror = (error) => {
                    console.error('[CompressionService] Worker error:', error);
                };

                const initId = generateId();
                const onInitResponse = (event: MessageEvent<CompressWorkerResponse>) => {
                    const data = event.data;
                    if (data.type === 'init-result' && data.id === initId) {
                        this.worker?.removeEventListener('message', onInitResponse);
                        this.isReady = data.payload.ready;
                        this.engine = data.payload.engine;
                        console.log(`[CompressionService] Ready with engine: ${this.engine}`);
                        resolve({ engine: this.engine });
                    }
                };

                this.worker.addEventListener('message', onInitResponse);
                this.worker.postMessage({ type: 'init', id: initId });

                // Timeout fallback
                setTimeout(() => {
                    if (!this.isReady) {
                        this.worker?.removeEventListener('message', onInitResponse);
                        this.isReady = true;
                        this.engine = 'canvas-fallback';
                        resolve({ engine: this.engine });
                    }
                }, 10000);
            } catch (error) {
                reject(error);
            }
        });
    }

    async compressFile(
        buffer: ArrayBuffer,
        level: CompressionLevel,
        removeMetadata = true,
        onProgress?: CompressionProgressCallback,
        customDpi?: number
    ): Promise<CompressOutcome> {
        if (!this.worker || !this.isReady) {
            await this.initialize();
        }

        return new Promise((resolve) => {
            const id = generateId();
            const bufferCopy = buffer.slice(0);

            this.pendingCallbacks.set(id, { resolve, onProgress, level, removeMetadata, customDpi });

            this.worker!.postMessage(
                { type: 'compress', id, payload: { buffer: bufferCopy, profile: level, removeMetadata, customDpi } },
                [bufferCopy]
            );

            // 5-minute safety timeout
            setTimeout(() => {
                if (this.pendingCallbacks.has(id)) {
                    this.pendingCallbacks.delete(id);
                    resolve({ success: false, error: 'Compression timed out.' });
                }
            }, 300000);
        });
    }

    private handleMessage(data: CompressWorkerResponse): void {
        const pending = this.pendingCallbacks.get(data.id);
        if (!pending) return;

        switch (data.type) {
            case 'progress':
                pending.onProgress?.(data.payload.progress, data.payload.message);
                break;

            case 'result':
                this.pendingCallbacks.delete(data.id);
                pending.resolve({
                    success: true,
                    data: data.payload.data,
                    originalSize: data.payload.originalSize,
                    compressedSize: data.payload.compressedSize,
                    engine: data.payload.engine,
                });
                break;

            case 'error':
                this.pendingCallbacks.delete(data.id);
                pending.resolve({ success: false, error: data.payload.error });
                break;

            case 'needs-render': {
                // Worker can't use DOM — render pages here on the main thread, send back JPEG bytes
                const { buffer } = data.payload;
                const level = pending.level ?? 'basic';
                const removeMetadata = pending.removeMetadata ?? true;
                const customDpi = pending.customDpi;
                const onProgress = pending.onProgress;
                const id = data.id;

                // Kick off async rendering without blocking the message handler
                this.renderAndSend(id, buffer, level, removeMetadata, onProgress, customDpi);
                break;
            }
        }
    }

    /**
     * Render PDF pages to JPEG on the main thread (DOM available here),
     * then send the JPEG bytes back to the worker for PDF assembly.
     */
    private async renderAndSend(
        id: string,
        buffer: ArrayBuffer,
        level: CompressionLevel,
        removeMetadata: boolean,
        onProgress?: CompressionProgressCallback,
        customDpi?: number
    ): Promise<void> {
        try {
            const config = getCanvasFallbackConfig(level, customDpi);
            onProgress?.(5, 'Loading PDF pages...');

            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

            const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
            const pdfDoc = await loadingTask.promise;
            const numPages = pdfDoc.numPages;

            const jpegPages: ArrayBuffer[] = [];
            const pageDimensions: { width: number; height: number }[] = [];
            const originalSize = buffer.byteLength;

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const pct = 5 + Math.round((pageNum / numPages) * 80);
                onProgress?.(pct, `Rendering page ${pageNum}/${numPages}...`);

                const page = await pdfDoc.getPage(pageNum);
                const origViewport = page.getViewport({ scale: 1.0 });
                const viewport = page.getViewport({ scale: config.scale });

                // Create a temporary canvas on the main thread (DOM available)
                const canvas = document.createElement('canvas');
                canvas.width = Math.floor(viewport.width);
                canvas.height = Math.floor(viewport.height);
                const context = canvas.getContext('2d')!;

                await page.render({ canvasContext: context, viewport, canvas } as any).promise;

                // Convert to JPEG blob
                const jpegBlob: Blob = await new Promise((res) =>
                    canvas.toBlob((b) => res(b!), 'image/jpeg', config.quality)
                );
                jpegPages.push(await jpegBlob.arrayBuffer());

                // PDF point dimensions (72pt = 1 inch, PDF user unit)
                pageDimensions.push({
                    width: origViewport.width * 0.75,
                    height: origViewport.height * 0.75,
                });

                page.cleanup();
            }

            pdfDoc.destroy();
            onProgress?.(88, 'Assembling compressed PDF...');

            // Send JPEG bytes to worker for assembly – transfer ownership for zero-copy
            this.worker!.postMessage(
                {
                    type: 'compress-assembled',
                    id,
                    payload: { jpegPages, pageDimensions, removeMetadata, originalSize },
                },
                jpegPages
            );
        } catch (err) {
            console.error('[CompressionService] renderAndSend failed:', err);
            const pending = this.pendingCallbacks.get(id);
            if (pending) {
                this.pendingCallbacks.delete(id);
                pending.resolve({
                    success: false,
                    error: err instanceof Error ? err.message : 'Failed to render PDF pages',
                });
            }
        }
    }

    cancel(): void {
        this.pendingCallbacks.forEach(({ resolve }) => {
            resolve({ success: false, error: 'Compression cancelled' });
        });
        this.pendingCallbacks.clear();
    }

    destroy(): void {
        this.cancel();
        this.worker?.terminate();
        this.worker = null;
        this.isReady = false;
    }

    getEngine(): 'ghostscript' | 'canvas-fallback' {
        return this.engine;
    }
}

// ─── Singleton ──────────────────────────────────────────────────────────────

let _instance: CompressionService | null = null;

export function getCompressionService(): CompressionService {
    if (!_instance) {
        _instance = new CompressionService();
    }
    return _instance;
}
