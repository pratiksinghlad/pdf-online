import type { FileProcessor } from './core';
import { ImageToPdfProcessor } from './imageToPdf';
import { TextToPdfProcessor } from './textToPdf';
import { PdfExtractorProcessor } from './pdfExtractor';

export class MergeOrchestrator {
    private getProcessor(type?: string): FileProcessor {
        if (type === 'image') return new ImageToPdfProcessor();
        if (type === 'text') return new TextToPdfProcessor();
        return new PdfExtractorProcessor(); // Default to PDF
    }

    async processFiles(files: { buffer: ArrayBuffer; name: string; type?: string }[]): Promise<{buffer: ArrayBuffer, name: string}[]> {
        const processedFiles: {buffer: ArrayBuffer, name: string}[] = [];
        
        for (const file of files) {
            console.log(`Orchestrator: Routing ${file.name} (type: ${file.type || 'pdf'}) to specific processor.`);
            const processor = this.getProcessor(file.type);
            const processedBuffer = await processor.process(file.buffer, file.name);
            processedFiles.push({
                buffer: processedBuffer,
                name: file.name
            });
        }
        
        return processedFiles;
    }
}
