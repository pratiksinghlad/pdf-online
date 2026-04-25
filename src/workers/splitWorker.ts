/**
 * Split PDF Worker
 *
 * Extracts page ranges from a source PDF entirely in a background thread.
 * Supports two output modes:
 *   - 'separate' → one ArrayBuffer per range, transferred individually
 *   - 'single'   → all ranges stitched into a single ArrayBuffer
 *
 * Uses pdf-lib `PDFDocument.copyPages()` which is DOM-free and safe in a
 * Worker context.
 */
import { PDFDocument } from 'pdf-lib';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PageRange {
    id: string;
    from: number; // 1-based, inclusive
    to: number;   // 1-based, inclusive
}

interface SplitInput {
    buffer: ArrayBuffer;
    ranges: PageRange[];
    outputMode: 'separate' | 'single';
}

interface SplitFileResult {
    data: ArrayBuffer;
    rangeLabel: string; // e.g. "1-3"
}

interface SplitWorkerResult {
    success: boolean;
    outputMode: 'separate' | 'single';
    files?: SplitFileResult[]; // separate mode
    data?: ArrayBuffer;        // single mode
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

/**
 * Extracts the pages specified by `range` from `sourceDoc` into a new PDF
 * document and returns its bytes.
 */
async function extractRange(sourceDoc: PDFDocument, range: PageRange): Promise<ArrayBuffer> {
    const target = await PDFDocument.create();
    // Convert 1-based range to 0-based indices
    const indices = Array.from(
        { length: range.to - range.from + 1 },
        (_, i) => range.from - 1 + i
    );
    const pages = await target.copyPages(sourceDoc, indices);
    pages.forEach((page) => target.addPage(page));
    const bytes = await target.save({ useObjectStreams: false, addDefaultPage: false });
    return toTransferableBuffer(bytes);
}

// ---------------------------------------------------------------------------
// Core split logic
// ---------------------------------------------------------------------------

async function splitPDF(input: SplitInput): Promise<SplitWorkerResult> {
    const { buffer, ranges, outputMode } = input;

    if (ranges.length === 0) {
        return { success: false, outputMode, error: 'No ranges specified' };
    }

    let sourceDoc: PDFDocument;
    try {
        sourceDoc = await PDFDocument.load(new Uint8Array(buffer));
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes('encrypt') || msg.toLowerCase().includes('password')) {
            return { success: false, outputMode, error: 'PDF is password-protected. Please unlock it first.' };
        }
        return { success: false, outputMode, error: `Failed to load PDF: ${msg}` };
    }

    const totalPages = sourceDoc.getPageCount();

    // Validate all ranges before doing any work
    for (const range of ranges) {
        if (range.from < 1 || range.to < range.from || range.to > totalPages) {
            return {
                success: false,
                outputMode,
                error: `Invalid range ${range.from}-${range.to} for a ${totalPages}-page document.`,
            };
        }
    }

    if (outputMode === 'separate') {
        const files: SplitFileResult[] = [];
        for (const range of ranges) {
            const data = await extractRange(sourceDoc, range);
            files.push({ data, rangeLabel: `${range.from}-${range.to}` });
        }
        return { success: true, outputMode: 'separate', files };
    }

    // Single mode — stitch all ranges into one document in order
    const combined = await PDFDocument.create();
    for (const range of ranges) {
        const indices = Array.from(
            { length: range.to - range.from + 1 },
            (_, i) => range.from - 1 + i
        );
        const pages = await combined.copyPages(sourceDoc, indices);
        pages.forEach((page) => combined.addPage(page));
    }
    const bytes = await combined.save({ useObjectStreams: false, addDefaultPage: false });
    return { success: true, outputMode: 'single', data: toTransferableBuffer(bytes) };
}

// ---------------------------------------------------------------------------
// Message handler
// ---------------------------------------------------------------------------

self.onmessage = async (event: MessageEvent) => {
    const { type, payload, id } = event.data;

    try {
        if (type !== 'split') {
            self.postMessage({
                id,
                type,
                result: { success: false, error: `Unknown message type: ${type}` },
            });
            return;
        }

        const result = await splitPDF(payload as SplitInput);

        if (result.success) {
            if (result.outputMode === 'separate' && result.files) {
                // Transfer all file buffers at once
                const transferables = result.files.map((f) => f.data);
                (self as unknown as { postMessage(msg: unknown, transfer: Transferable[]): void })
                    .postMessage({ id, type, result }, transferables);
            } else if (result.outputMode === 'single' && result.data) {
                (self as unknown as { postMessage(msg: unknown, transfer: Transferable[]): void })
                    .postMessage({ id, type, result }, [result.data]);
            } else {
                self.postMessage({ id, type, result });
            }
        } else {
            self.postMessage({ id, type, result });
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
