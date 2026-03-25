import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { FileProcessor } from './core';

export class TextToPdfProcessor implements FileProcessor {
    async process(buffer: ArrayBuffer, name: string): Promise<ArrayBuffer> {
        const mergedPdf = await PDFDocument.create();
        
        try {
            const font = await mergedPdf.embedFont(StandardFonts.Helvetica);
            const textDecoder = new TextDecoder('utf-8');
            const textContent = textDecoder.decode(buffer);
            
            // Define standard A4 page dimensions and margins
            const width = 595.28;
            const height = 841.89;
            const margin = 50;
            const fontSize = 12;
            const lineHeight = fontSize * 1.5;
            const effectiveWidth = width - 2 * margin;
            
            // Split text into lines, handling manual line breaks mapping to new lines
            const rawLines = textContent.split(/\r?\n/);
            const lines: string[] = [];
            
            // Word wrap
            for (const rawLine of rawLines) {
                if (rawLine.trim() === '') {
                    lines.push('');
                    continue;
                }
                
                const words = rawLine.split(' ');
                let currentLine = '';
                
                for (let i = 0; i < words.length; i++) {
                    const word = words[i];
                    const testLine = currentLine ? `${currentLine} ${word}` : word;
                    const textWidth = font.widthOfTextAtSize(testLine, fontSize);
                    
                    if (textWidth > effectiveWidth) {
                        if (currentLine) {
                            lines.push(currentLine);
                            currentLine = word;
                        } else {
                            // Single word is too long, force break it
                            lines.push(word);
                            currentLine = '';
                        }
                    } else {
                        currentLine = testLine;
                    }
                }
                if (currentLine) {
                    lines.push(currentLine);
                }
            }
            
            // Draw lines onto pages
            const maxLinesPerPage = Math.floor((height - 2 * margin) / lineHeight);
            
            for (let i = 0; i < lines.length; i += maxLinesPerPage) {
                const page = mergedPdf.addPage([width, height]);
                const pageLines = lines.slice(i, i + maxLinesPerPage);
                
                let y = height - margin - fontSize;
                for (const line of pageLines) {
                    page.drawText(line, {
                        x: margin,
                        y,
                        size: fontSize,
                        font,
                        color: rgb(0, 0, 0),
                    });
                    y -= lineHeight;
                }
            }
            
            // In case of empty text, add a blank page
            if (lines.length === 0) {
                mergedPdf.addPage([width, height]);
            }
            
            const pdfBytes = await mergedPdf.save({ useObjectStreams: false });
            return pdfBytes.buffer.slice(
                pdfBytes.byteOffset, 
                pdfBytes.byteOffset + pdfBytes.byteLength
            ) as ArrayBuffer;
        } catch (error) {
            console.error('Text processing failed for file:', name, error);
            throw new Error(`Failed to convert text file ${name} to PDF`);
        }
    }
}
