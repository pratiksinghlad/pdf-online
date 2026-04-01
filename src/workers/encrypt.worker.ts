/// <reference lib="webworker" />
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';

self.addEventListener("message", async (event: MessageEvent) => {
  const { type, payload, id } = event.data;

  if (type === "encrypt") {
    try {
      const { buffer, password } = payload;
      
      const uint8ArrayBuffer = new Uint8Array(buffer);
      // encryptPDF converts binary to encrypted binary
      const encryptedPdfBytes = await encryptPDF(uint8ArrayBuffer, password);

      self.postMessage(
        { id, result: { success: true, data: encryptedPdfBytes.buffer } },
        { transfer: [encryptedPdfBytes.buffer] }
      );
    } 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
      self.postMessage({ id, result: { success: false, error: error.message || error.toString() } });
    }
  }
});
