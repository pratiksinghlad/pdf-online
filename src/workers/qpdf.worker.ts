/// <reference lib="webworker" />
import createModule from "@neslinesli93/qpdf-wasm";

// Cache the module initialization
let qpdfModule: any = null;

async function getModule() {
  if (!qpdfModule) {
    qpdfModule = await createModule();
  }
  return qpdfModule;
}

self.onmessage = async (e: MessageEvent) => {
  const { id, type, payload } = e.data;

  if (type === "unlock") {
    try {
      const { buffer, password } = payload;
      const qpdf = await getModule();

      const inputFileName = `input_${id}.pdf`;
      const outputFileName = `output_${id}.pdf`;

      // Write to Emscripten's virtual file system
      qpdf.FS.writeFile(inputFileName, new Uint8Array(buffer));

      // Build QPDF args
      // --decrypt effectively removes the password if the provided password is correct
      const args = ["--decrypt"];
      if (password) {
        args.push(`--password=${password}`);
      }
      args.push(inputFileName);
      args.push(outputFileName);

      // Execute QPDF
      // callMain returns the exit code (0 for success)
      const exitCode = qpdf.callMain(args);

      if (exitCode !== 0) {
        // Clean up input file even on failure
        try { qpdf.FS.unlink(inputFileName); } catch (e) {}
        throw new Error(`QPDF failed with exit code ${exitCode}. Please check the password.`);
      }

      // Read the decrypted result from the virtual file system
      const outputData = qpdf.FS.readFile(outputFileName);
      
      // Clean up virtual files to save memory
      try { qpdf.FS.unlink(inputFileName); } catch (e) {}
      try { qpdf.FS.unlink(outputFileName); } catch (e) {}

      // Return the structural result (preserving all text, vectors, etc.)
      self.postMessage(
        { 
          id, 
          result: { 
            success: true, 
            data: outputData.buffer, 
            isEncrypted: true 
          } 
        }, 
        { transfer: [outputData.buffer] }
      );

    } catch (err: any) {
      self.postMessage({ 
        id, 
        result: { 
          success: false, 
          error: err.message || "Failed to structurally unlock the PDF." 
        } 
      });
    }
  }
};
