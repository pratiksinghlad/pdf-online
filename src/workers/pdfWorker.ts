/**
 * PDF Merge Worker
 * Handles heavy PDF operations in a separate thread
 * Uses transferable objects to minimize memory copying
 */

import { PDFDocument } from 'pdf-lib';

interface MergeInput {
    files: {
        id: string;
        buffer: ArrayBuffer;
        name: string;
    }[];
    pageOrder?: { fileId: string; pageIndex: number }[];
}

interface MergeResult {
    success: boolean;
    data?: ArrayBuffer;
    error?: string;
    pageCount?: number;
}

interface GetPageCountInput {
    buffer: ArrayBuffer;
}

interface GetPageCountResult {
    success: boolean;
    pageCount?: number;
    error?: string;
}

// Message handler
self.onmessage = async (event: MessageEvent) => {
    const { type, payload, id } = event.data;

    try {
        switch (type) {
            case 'merge': {
                const result = await mergePDFs(payload as MergeInput);

                if (result.success && result.data) {
                    // Transfer the ArrayBuffer to avoid copying
                    self.postMessage(
                        { id, type: 'merge', result },
                        { transfer: [result.data] }
                    );
                } else {
                    self.postMessage({ id, type: 'merge', result });
                }
                break;
            }

            case 'getPageCount': {
                const result = await getPageCount(payload as GetPageCountInput);
                self.postMessage({ id, type: 'getPageCount', result });
                break;
            }

            default:
                self.postMessage({
                    id,
                    type,
                    result: { success: false, error: `Unknown message type: ${type}` },
                });
        }
    } catch (error) {
        self.postMessage({
            id,
            type,
            result: {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            },
        });
    }
};

/**
 * Merge multiple PDFs into one
 */
async function mergePDFs(input: MergeInput): Promise<MergeResult> {
    const { files, pageOrder } = input;

    if (files.length === 0) {
        return { success: false, error: 'No files to merge' };
    }

    try {
        // Create a new PDF document
        const mergedPdf = await PDFDocument.create();

        // Load all source PDFs
        const loadedPdfs: Map<string, PDFDocument> = new Map();

        for (const file of files) {
            try {
                const pdf = await PDFDocument.load(file.buffer, {
                    ignoreEncryption: true,
                });
                loadedPdfs.set(file.id, pdf);
            } catch (error) {
                // Handle corrupted or encrypted PDFs
                const message = error instanceof Error ? error.message : 'Unknown error';
                if (message.includes('encrypt')) {
                    return { success: false, error: `File "${file.name}" is encrypted and cannot be merged.` };
                }
                return { success: false, error: `Failed to load "${file.name}": ${message}` };
            }
        }

        // If pageOrder is specified, use it; otherwise merge all pages in file order
        if (pageOrder && pageOrder.length > 0) {
            for (const { fileId, pageIndex } of pageOrder) {
                const pdf = loadedPdfs.get(fileId);
                if (pdf) {
                    const [copiedPage] = await mergedPdf.copyPages(pdf, [pageIndex]);
                    mergedPdf.addPage(copiedPage);
                }
            }
        } else {
            // Merge all pages from each file in order
            for (const file of files) {
                const pdf = loadedPdfs.get(file.id);
                if (pdf) {
                    const pageCount = pdf.getPageCount();
                    const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
                    const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                }
            }
        }

        // Save the merged PDF
        const mergedPdfBytes = await mergedPdf.save();
        const totalPages = mergedPdf.getPageCount();

        // Convert Uint8Array to ArrayBuffer for transfer
        const buffer = mergedPdfBytes.buffer.slice(
            mergedPdfBytes.byteOffset,
            mergedPdfBytes.byteOffset + mergedPdfBytes.byteLength
        );

        return { success: true, data: buffer as ArrayBuffer, pageCount: totalPages };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to merge PDFs',
        };
    }
}

/**
 * Get page count from a PDF
 */
async function getPageCount(input: GetPageCountInput): Promise<GetPageCountResult> {
    try {
        const pdf = await PDFDocument.load(input.buffer, {
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

export { };
