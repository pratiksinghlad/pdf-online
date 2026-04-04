/// <reference lib="webworker" />
import createModule from "@neslinesli93/qpdf-wasm";

import qpdfWasmUrl from "@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let qpdfPromise: any = null;

async function getQPDF() {
  if (!qpdfPromise) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    qpdfPromise = (createModule as any)({
      locateFile: () => qpdfWasmUrl,
    });
  }
  return qpdfPromise;
}

self.addEventListener("message", async (event: MessageEvent) => {
  const { type, payload, id } = event.data;

  if (type === "unlock") {
    try {
      const { buffer, password } = payload;
      const qpdf = await getQPDF();

      // Write input file to virtual filesystem
      const inputPath = "/input.pdf";
      const outputPath = "/output.pdf";
      
      qpdf.FS.writeFile(inputPath, new Uint8Array(buffer));

      // Build arguments for decryption
      const args = ["--decrypt"];
      if (password) {
        args.push(`--password=${password}`);
      }
      args.push(inputPath);
      args.push(outputPath);

      // Run QPDF
      // callMain returns 0 on success
      const result = qpdf.callMain(args);

      if (result !== 0) {
        throw new Error(`QPDF failed with exit code ${result}. Check if the password is correct.`);
      }

      // Read output file from virtual filesystem
      const outputData = qpdf.FS.readFile(outputPath);
      
      // Clean up files in virtual FS
      try {
        qpdf.FS.unlink(inputPath);
        qpdf.FS.unlink(outputPath);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // Ignore cleanup errors
      }

      self.postMessage(
        { 
          id, 
          result: { 
            success: true, 
            data: outputData.buffer, 
            isEncrypted: !!password // If a password was needed/provided, it was encrypted
          } 
        },
        { transfer: [outputData.buffer] }
      );
    } 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
      const errorMessage = error.message || error.toString();
      
      // If QPDF says it's not encrypted, we can still succeed by returning the original
      if (errorMessage.includes("not encrypted") || errorMessage.includes("already decrypted")) {
         self.postMessage(
           { 
             id, 
             result: { 
               success: true, 
               data: payload.buffer, 
               isEncrypted: false 
             } 
           }
         );
         return;
      }

      self.postMessage({ id, result: { success: false, error: errorMessage } });
    }
  }
});
