import { PDFDocument } from 'pdf-lib';
import type { FileProcessor } from './core';

export class ImageToPdfProcessor implements FileProcessor {
    async process(buffer: ArrayBuffer, name: string): Promise<ArrayBuffer> {
        const mergedPdf = await PDFDocument.create();
        
        try {
            // Use standard browser ImageBitmap to handle all formats (JPG, PNG, WEBP)
            // This normalizes everything and avoids format-specific parsing errors
            const blob = new Blob([buffer]);
            const imgBitmap = await createImageBitmap(blob);
            
            // Create OffscreenCanvas and draw image
            const canvas = new OffscreenCanvas(imgBitmap.width, imgBitmap.height);
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                throw new Error('Could not create OffscreenCanvas context');
            }
            
            ctx.drawImage(imgBitmap, 0, 0);
            
            // Convert to JPEG for best size/perf trade-off in PDF
            const outBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
            const outBuffer = await outBlob.arrayBuffer();
            
            // Embed JPEG into PDF
            const image = await mergedPdf.embedJpg(outBuffer);
            
            // A4 page dimensions (in points): 595.28 x 841.89
            // Let's adapt page strictly to image proportion
            const page = mergedPdf.addPage([image.width, image.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });
            
            const pdfBytes = await mergedPdf.save();
            return pdfBytes.buffer.slice(
                pdfBytes.byteOffset, 
                pdfBytes.byteOffset + pdfBytes.byteLength
            ) as ArrayBuffer;
        } catch (error) {
            console.error(`Image processing failed for ${name}:`, error);
            throw new Error(`Failed to convert image ${name} to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
