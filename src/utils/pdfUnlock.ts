/**
 * PDF Unlock Utility
 * 
 * Uses pdfjs-dist (Mozilla's PDF engine, same as Firefox) to open encrypted PDFs
 * with the provided password, then renders each page at high quality and
 * reconstructs a new unprotected PDF using jsPDF.
 * 
 * This approach handles ALL PDF encryption types:
 * - RC4 40-bit / 128-bit
 * - AES-128
 * - AES-256
 * 
 * 100% client-side, no data leaves the browser.
 */
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";

// Ensure pdfjs worker is configured
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

/** Scale factor for rendering. 2 = ~144 DPI (good quality, reasonable size) */
const RENDER_SCALE = 2;

/** JPEG quality for rendered pages (0-1) */
const JPEG_QUALITY = 0.92;

export interface UnlockResult {
  success: true;
  data: ArrayBuffer;
  isEncrypted: true;
}

export interface NotProtectedResult {
  success: true;
  data: null;
  isEncrypted: false;
}

export interface UnlockError {
  success: false;
  error: string;
}

export type UnlockOutcome = UnlockResult | NotProtectedResult | UnlockError;

/**
 * Check whether a PDF buffer is password-protected.
 */
export async function checkIfEncrypted(buffer: ArrayBuffer): Promise<boolean> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer.slice(0)),
      // Don't provide a password — if it loads, it's not encrypted
    });
    const pdf = await loadingTask.promise;
    pdf.destroy();
    return false;
  } catch (err: unknown) {
    const error = err as { name?: string };
    if (error.name === "PasswordException") {
      return true;
    }
    // Some other parse error — treat as not encrypted (might be corrupt)
    return false;
  }
}

/**
 * Unlock a password-protected PDF.
 * 
 * Opens the encrypted PDF with pdfjs-dist using the provided password,
 * renders every page to a canvas at high DPI, and creates a new clean
 * PDF using jsPDF.
 */
export async function unlockPdf(
  buffer: ArrayBuffer,
  password: string
): Promise<UnlockOutcome> {
  // Step 1: Check if the PDF is actually encrypted
  const encrypted = await checkIfEncrypted(buffer);
  if (!encrypted) {
    return { success: true, data: null, isEncrypted: false };
  }

  // Step 2: Open the encrypted PDF with the password
  let pdf: pdfjsLib.PDFDocumentProxy;
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer.slice(0)),
      password: password,
    });
    pdf = await loadingTask.promise;
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };
    if (error.name === "PasswordException") {
      return { success: false, error: "Incorrect password. Please try again." };
    }
    return {
      success: false,
      error: error.message || "Failed to open the PDF. It may be corrupted.",
    };
  }

  try {
    // Step 3: Render each page and build a new PDF
    const numPages = pdf.numPages;

    // Get first page to initialize jsPDF with correct dimensions
    const firstPage = await pdf.getPage(1);
    const firstViewport = firstPage.getViewport({ scale: RENDER_SCALE });

    // jsPDF uses points (72 DPI) for page dimensions
    // Our rendered pixels / RENDER_SCALE = original page size in points
    const pageWidthPt = firstViewport.width / RENDER_SCALE;
    const pageHeightPt = firstViewport.height / RENDER_SCALE;

    const doc = new jsPDF({
      orientation: pageWidthPt > pageHeightPt ? "landscape" : "portrait",
      unit: "pt",
      format: [pageWidthPt, pageHeightPt],
      compress: true,
    });

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: RENDER_SCALE });

      // Create an offscreen canvas for rendering
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to create canvas context for rendering.");
      }

      // Render the page
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (page.render({ canvasContext: ctx, viewport, canvas } as any).promise);

      // Convert to image
      const imgData = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

      // Calculate page dimensions in points
      const pWidthPt = viewport.width / RENDER_SCALE;
      const pHeightPt = viewport.height / RENDER_SCALE;

      if (pageNum > 1) {
        doc.addPage(
          [pWidthPt, pHeightPt],
          pWidthPt > pHeightPt ? "landscape" : "portrait"
        );
      }

      // Add the rendered image filling the entire page
      doc.addImage(imgData, "JPEG", 0, 0, pWidthPt, pHeightPt);

      // Clean up
      canvas.width = 0;
      canvas.height = 0;
    }

    pdf.destroy();

    // Step 4: Output the new unprotected PDF
    const outputBuffer = doc.output("arraybuffer");
    return { success: true, data: outputBuffer, isEncrypted: true };
  } catch (err: unknown) {
    pdf.destroy();
    const error = err as { message?: string };
    return {
      success: false,
      error: error.message || "Failed to render PDF pages.",
    };
  }
}
