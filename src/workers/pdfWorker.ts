/**
 * PDF Merge Worker
 * Handles heavy PDF operations in a separate thread
 * Uses transferable objects to minimize memory copying
 */
/* eslint-disable @typescript-eslint/no-explicit-any, prefer-const, react-refresh/only-export-components */
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
    console.log(`Worker received: ${type}`, id);

    try {
        switch (type) {
            case 'merge': {
                console.log('Worker starting merge...');
                const result = await mergePDFs(payload as MergeInput);
                console.log('Worker merge result:', result.success);

                if (result.success && result.data) {
                    // Transfer the ArrayBuffer to avoid copying
                    (self as unknown as {
                        postMessage(message: any, transfer?: Transferable[]): void;
                    }).postMessage({ id, type: 'merge', result }, [result.data]);
                } else {
                    self.postMessage({ id, type: 'merge', result });
                }
                break;
            }

            case 'getPageCount': {
                console.log('Worker getting page count...');
                const result = await getPageCount(payload as GetPageCountInput);
                console.log('Worker page count result:', result.success, result.pageCount);
                self.postMessage({ id, type: 'getPageCount', result });
                break;
            }

            default:
                console.warn('Worker unknown message type:', type);
                self.postMessage({
                    id,
                    type,
                    result: { success: false, error: `Unknown message type: ${type}` },
                });
        }
    } catch (error) {
        console.error('Worker top-level error:', error);
        self.postMessage({
            id,
            type,
            result: {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown worker error occurred',
            },
        });
    }
};

/**
 * Merge multiple PDFs into one
 */
async function mergePDFs(input: MergeInput): Promise<MergeResult> {
    const { files } = input;

    if (files.length === 0) {
        return { success: false, error: 'No files to merge' };
    }

    try {
        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
            console.log(`Worker processing "${file.name}"...`);
            try {
                if (!file.buffer || file.buffer.byteLength === 0) {
                    throw new Error('File buffer is empty');
                }

                // Load source PDF with robust handling
                // We do NOT use ignoreEncryption: true as a fallback because it causes 
                // "Unknown compression method" crashes when accessing encrypted streams.
                let sourceDoc: PDFDocument;
                try {
                    sourceDoc = await PDFDocument.load(new Uint8Array(file.buffer));
                } catch (loadError) {
                    const msg = loadError instanceof Error ? loadError.message : String(loadError);

                    // Check for encryption/password errors specifically
                    if (msg.toLowerCase().includes('encrypted') || msg.toLowerCase().includes('password')) {
                        console.error(`Encryption error for ${file.name}:`, msg);
                        throw new Error(`"${file.name}" is password protected. Please remove the password and try again.`);
                    }

                    console.error(`Standard load failed for ${file.name}:`, msg);
                    throw new Error(`Failed to load "${file.name}". standard PDF library could not open it (Error: ${msg})`);
                }

                const pageIndices = sourceDoc.getPageIndices();
                console.log(`Embedding ${pageIndices.length} pages from "${file.name}"...`);

                // Embed pages to avoid resource conflicts and ensure visual fidelity
                const embeddedPages = await mergedPdf.embedPdf(sourceDoc, pageIndices);

                for (let i = 0; i < embeddedPages.length; i++) {
                    const embeddedPage = embeddedPages[i];
                    // Create a new page with the same dimensions as the embedded page
                    const newPage = mergedPdf.addPage([embeddedPage.width, embeddedPage.height]);

                    // Draw the embedded page onto the new page
                    newPage.drawPage(embeddedPage, {
                        x: 0,
                        y: 0,
                        width: embeddedPage.width,
                        height: embeddedPage.height,
                    });
                }
            } catch (err) {
                console.error(`Error with file ${file.name}:`, err);
                // Propagate specific error message to the UI
                return {
                    success: false,
                    error: err instanceof Error ? err.message : `Failed to process "${file.name}"`
                };
            }
        }

        // Save with compatibility options
        // Turning off object streams helps some viewers render correctly
        const mergedBytes = await mergedPdf.save({
            useObjectStreams: false,
            addDefaultPage: false,
        });

        const buffer = mergedBytes.buffer.slice(
            mergedBytes.byteOffset,
            mergedBytes.byteOffset + mergedBytes.byteLength
        );

        return {
            success: true,
            data: buffer as ArrayBuffer,
            pageCount: mergedPdf.getPageCount()
        };
    } catch (error) {
        console.error('Merge process fatal error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'PDF merge failed unexpectedly'
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

export { };
