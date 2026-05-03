/**
 * Organize PDF Worker
 *
 * Handles page reordering, rotation, and deletion entirely in a background thread.
 * Uses pdf-lib `PDFDocument.copyPages()` which is DOM-free and safe in a Worker context.
 * Leverages transferable ArrayBuffers to minimize memory overhead.
 */
import { PDFDocument, degrees } from 'pdf-lib';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrganizedPage {
    id: string;
    pageIndex: number;   // 0-based index in the source PDF
    rotation: number;    // 0, 90, 180, 270
}

interface OrganizeInput {
    buffer: ArrayBuffer;
    pages: OrganizedPage[];
}

interface OrganizeResult {
    success: boolean;
    data?: ArrayBuffer;
    pageCount?: number;
    error?: string;
}

interface GetPageCountInput {
    buffer: ArrayBuffer;
}

interface GetPageCountResult {
    success: boolean;
    pageCount?: number;
    error?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a Uint8Array produced by pdf-lib into a standalone ArrayBuffer
 * that is safe to transfer via postMessage (no shared memory overlap).
 */
function toTransferableBuffer(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

// ---------------------------------------------------------------------------
// Core organize logic
// ---------------------------------------------------------------------------

async function organizePDF(input: OrganizeInput): Promise<OrganizeResult> {
    const { buffer, pages } = input;

    if (pages.length === 0) {
        return { success: false, error: 'No pages to process' };
    }

    let sourceDoc: PDFDocument;
    try {
        sourceDoc = await PDFDocument.load(new Uint8Array(buffer));
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes('encrypt') || msg.toLowerCase().includes('password')) {
            return { success: false, error: 'PDF is password-protected. Please unlock it first.' };
        }
        return { success: false, error: `Failed to load PDF: ${msg}` };
    }

    const totalSourcePages = sourceDoc.getPageCount();

    // Validate all page indices
    for (const page of pages) {
        if (page.pageIndex < 0 || page.pageIndex >= totalSourcePages) {
            return {
                success: false,
                error: `Invalid page index ${page.pageIndex} for a ${totalSourcePages}-page document.`,
            };
        }
    }

    try {
        const outputDoc = await PDFDocument.create();

        // Single-pass: copy pages in the specified order
        const indices = pages.map((p) => p.pageIndex);
        const copiedPages = await outputDoc.copyPages(sourceDoc, indices);

        for (let i = 0; i < copiedPages.length; i++) {
            const page = copiedPages[i];
            const rotation = pages[i].rotation;

            // Apply rotation if needed (cumulative with existing rotation)
            if (rotation !== 0) {
                const currentRotation = page.getRotation().angle;
                page.setRotation(degrees(currentRotation + rotation));
            }

            outputDoc.addPage(page);
        }

        const bytes = await outputDoc.save({ useObjectStreams: false, addDefaultPage: false });

        return {
            success: true,
            data: toTransferableBuffer(bytes),
            pageCount: outputDoc.getPageCount(),
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Failed to organize PDF',
        };
    }
}

/**
 * Get page count from a PDF
 */
async function getPageCount(input: GetPageCountInput): Promise<GetPageCountResult> {
    try {
        const pdf = await PDFDocument.load(new Uint8Array(input.buffer), {
            ignoreEncryption: true,
        });
        return { success: true, pageCount: pdf.getPageCount() };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        if (message.includes('encrypt')) {
            return { success: false, error: 'PDF is encrypted' };
        }
        return { success: false, error: `Failed to read PDF: ${message}` };
    }
}

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
self.onmessage = async (event: MessageEvent) => {
    const { type, payload, id } = event.data;

    try {
        switch (type) {
            case 'organize': {
                const result = await organizePDF(payload as OrganizeInput);

                if (result.success && result.data) {
                    (self as unknown as {
                        postMessage(message: any, transfer?: Transferable[]): void;
                    }).postMessage({ id, type, result }, [result.data]);
                } else {
                    self.postMessage({ id, type, result });
                }
                break;
            }

            case 'getPageCount': {
                const result = await getPageCount(payload as GetPageCountInput);
                self.postMessage({ id, type, result });
                break;
            }

            default:
                self.postMessage({
                    id,
                    type,
                    result: { success: false, error: `Unknown message type: ${type}` },
                });
        }
    } catch (err) {
        self.postMessage({
            id,
            type,
            result: {
                success: false,
                error: err instanceof Error ? err.message : 'Unexpected worker error',
            },
        });
    }
};

export {};
