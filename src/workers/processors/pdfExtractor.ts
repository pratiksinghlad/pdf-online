import type { FileProcessor } from './core';

export class PdfExtractorProcessor implements FileProcessor {
    async process(buffer: ArrayBuffer): Promise<ArrayBuffer> {
        // PDF files are already in the correct format. 
        // We just return the buffer directly for the orchestrator to merge.
        return buffer;
    }
}
