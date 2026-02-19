/**
 * PDF Compression Web Worker
 *
 * DOM-FREE: This worker uses only pdf-lib (no pdfjs, no canvas, no document API).
 * It receives pre-rendered JPEG bytes from the main thread and assemblies them
 * into a compressed PDF.
 *
 * Strategy:
 *   1. PRIMARY: Try Ghostscript WASM for professional-grade compression
 *   2. FALLBACK: Assemble pre-rendered JPEG pages (sent from main thread) via pdf-lib
 *
 * Vite-compatible: loaded via `new Worker(new URL('./compressWorker.ts', import.meta.url))`
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { PDFDocument } from 'pdf-lib';
import { getGhostscriptArgs } from '../services/compressionConfig';
import type { CompressionLevel, CompressWorkerMessage, CompressWorkerResponse } from '../types/compress';

// Define a basic interface for the Ghostscript module
interface GhostscriptModule {
    FS: {
        writeFile: (path: string, data: Uint8Array) => void;
        readFile: (path: string) => Uint8Array;
        unlink: (path: string) => void;
    };
    callMain: (args: string[]) => void;
}

// ─── State ──────────────────────────────────────────────────────────────────

let gsModule: GhostscriptModule | null = null;
let engine: 'ghostscript' | 'canvas-fallback' = 'canvas-fallback';

// ─── Ghostscript WASM Loader ────────────────────────────────────────────────

async function initGhostscript(): Promise<boolean> {
    try {
        const baseUrl = self.location.origin;
        const gsJsUrl = `${baseUrl}/pdf-online/gs/gs.js`;

        const response = await fetch(gsJsUrl, { method: 'HEAD' });
        if (!response.ok) {
            console.warn('[CompressWorker] Ghostscript WASM not found at', gsJsUrl);
            return false;
        }

        (self as any).importScripts(gsJsUrl);

        const GS = (self as any).gs || (self as any).GS || (self as any).Module;
        if (!GS) {
            console.warn('[CompressWorker] GS module not found on global scope');
            return false;
        }

        gsModule = typeof GS === 'function' ? await GS() : GS;
        engine = 'ghostscript';
        console.log('[CompressWorker] Ghostscript WASM initialized successfully');
        return true;
    } catch (error) {
        console.warn('[CompressWorker] Failed to init Ghostscript WASM, using pdf-lib fallback:', error);
        return false;
    }
}

// ─── Ghostscript Compression ────────────────────────────────────────────────

async function compressWithGhostscript(
    buffer: ArrayBuffer,
    level: CompressionLevel,
    sendProgress: (progress: number, message: string) => void,
    customDpi?: number
): Promise<ArrayBuffer> {
    if (!gsModule) throw new Error('Ghostscript module not initialized');

    sendProgress(10, 'Writing PDF to virtual filesystem...');
    const inputPath = '/input.pdf';
    const outputPath = '/output.pdf';

    gsModule.FS.writeFile(inputPath, new Uint8Array(buffer));
    sendProgress(20, 'Running Ghostscript compression...');

    const args = getGhostscriptArgs(inputPath, outputPath, level, customDpi);
    try {
        gsModule.callMain(args);
    } catch (e: any) {
        if (e.status !== undefined && e.status !== 0) {
            throw new Error(`Ghostscript failed with exit code ${e.status}`);
        }
    }

    sendProgress(80, 'Reading compressed output...');
    const outputData = gsModule.FS.readFile(outputPath);

    try {
        gsModule.FS.unlink(inputPath);
        gsModule.FS.unlink(outputPath);
    } catch { /* ignore */ }

    sendProgress(95, 'Finalizing...');
    const result = new ArrayBuffer(outputData.byteLength);
    new Uint8Array(result).set(outputData);
    return result;
}

// ─── pdf-lib Fallback: Assemble pre-rendered JPEG pages ────────────────────
// The main thread renders each page to JPEG (it has DOM access) and sends
// the bytes here. We assemble them into a compressed PDF with pdf-lib.

async function assembleFromJpegPages(
    jpegPages: ArrayBuffer[],
    pageDimensions: { width: number; height: number }[],
    removeMetadata: boolean,
    sendProgress: (progress: number, message: string) => void
): Promise<ArrayBuffer> {
    sendProgress(5, `Assembling ${jpegPages.length} pages...`);

    const newDoc = await PDFDocument.create();

    for (let i = 0; i < jpegPages.length; i++) {
        const pct = 5 + Math.round(((i + 1) / jpegPages.length) * 85);
        sendProgress(pct, `Embedding page ${i + 1}/${jpegPages.length}...`);

        const jpegBytes = new Uint8Array(jpegPages[i]);
        const jpegImage = await newDoc.embedJpg(jpegBytes);
        const { width, height } = pageDimensions[i];
        const newPage = newDoc.addPage([width, height]);
        newPage.drawImage(jpegImage, { x: 0, y: 0, width, height });
    }

    sendProgress(92, 'Finalizing PDF...');

    if (removeMetadata) {
        newDoc.setTitle('');
        newDoc.setAuthor('');
        newDoc.setSubject('');
        newDoc.setKeywords([]);
        newDoc.setCreator('');
    }
    newDoc.setProducer('PDF Online Compressor');

    const compressedBytes = await newDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
    });

    sendProgress(98, 'Done!');

    const resultBuffer = new ArrayBuffer(compressedBytes.byteLength);
    new Uint8Array(resultBuffer).set(compressedBytes);
    return resultBuffer;
}

// ─── Message Handler ────────────────────────────────────────────────────────

function sendResponse(response: CompressWorkerResponse) {
    if (response.type === 'result' && response.payload.success) {
        (self as any).postMessage(response, [response.payload.data]);
    } else {
        self.postMessage(response);
    }
}

self.onmessage = async (event: MessageEvent<CompressWorkerMessage>) => {
    const message = event.data;

    try {
        switch (message.type) {
            case 'init': {
                const gsReady = await initGhostscript();
                sendResponse({
                    type: 'init-result',
                    id: message.id,
                    payload: {
                        ready: true,
                        engine: gsReady ? 'ghostscript' : 'canvas-fallback',
                        error: gsReady ? undefined : 'Using pdf-lib fallback (Ghostscript WASM not available)',
                    },
                });
                break;
            }

            case 'compress': {
                const { buffer, profile, customDpi } = message.payload;
                const originalSize = buffer.byteLength;

                const sendProgress = (progress: number, msg: string) => {
                    sendResponse({
                        type: 'progress',
                        id: message.id,
                        payload: { progress, message: msg },
                    });
                };

                let compressedBuffer: ArrayBuffer;

                if (engine === 'ghostscript' && gsModule) {
                    compressedBuffer = await compressWithGhostscript(buffer, profile, sendProgress, customDpi);
                } else {
                    // Cannot render PDF pages in a worker (no DOM) — ask main thread
                    (self as any).postMessage({ type: 'needs-render', id: message.id, payload: { buffer } } satisfies CompressWorkerResponse, [buffer]);
                    return;
                }

                sendResponse({
                    type: 'result',
                    id: message.id,
                    payload: {
                        success: true,
                        data: compressedBuffer,
                        originalSize,
                        compressedSize: compressedBuffer.byteLength,
                        engine,
                    },
                });
                break;
            }

            case 'compress-assembled': {
                const { jpegPages, pageDimensions, removeMetadata, originalSize } = message.payload;

                const sendProgress = (progress: number, msg: string) => {
                    sendResponse({
                        type: 'progress',
                        id: message.id,
                        payload: { progress, message: msg },
                    });
                };

                const compressedBuffer = await assembleFromJpegPages(
                    jpegPages, pageDimensions, removeMetadata, sendProgress
                );

                sendResponse({
                    type: 'result',
                    id: message.id,
                    payload: {
                        success: true,
                        data: compressedBuffer,
                        originalSize,
                        compressedSize: compressedBuffer.byteLength,
                        engine: 'canvas-fallback',
                    },
                });
                break;
            }
        }
    } catch (error) {
        console.error('[CompressWorker] Error:', error);
        sendResponse({
            type: 'error',
            id: message.id,
            payload: {
                success: false,
                error: error instanceof Error ? error.message : 'Compression failed unexpectedly',
            },
        });
    }
};

export {};
