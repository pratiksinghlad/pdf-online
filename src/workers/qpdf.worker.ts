/// <reference lib="webworker" />

/**
 * QPDF Web Worker — PDF decrypt / unlock operations.
 *
 * Root cause of the "Aborted(CompileError): expected magic word 00 61 73 6d,
 * found 3c 21 64 6f" error:
 *
 *   The Emscripten-generated qpdf.js derives the .wasm URL from
 *   `self.location.href` (the worker script URL). When Vite hashes and
 *   chunks the worker, that base path is wrong and the browser fetches the
 *   SPA HTML fallback page instead of the real binary file.
 *   (Magic bytes 3c 21 64 6f = "<!do" are the start of "<!doctype html>")
 *
 * Fix:
 *   Import the .wasm file with Vite's `?url` query. This causes Vite to:
 *     1. Include qpdf.wasm in the build output with a content-hashed filename.
 *     2. Give us the correct absolute URL to that file at runtime.
 *   We then pass this URL to Emscripten via `locateFile`, bypassing the
 *   broken automatic path resolution.
 *
 * Note: The `?url` import causes Vite to treat the .wasm as a static asset
 *   (URL reference), NOT as a WASM module. This is intentional — Emscripten
 *   fetches and instantiates the WASM itself; we just need to tell it where.
 */

import createQpdfModule from "@neslinesli93/qpdf-wasm";
// Import the WASM binary as a URL string — Vite resolves this to the correct
// content-hashed asset path for both dev and production deployments.
import qpdfWasmUrl from "@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url";

/**
 * Full Emscripten FS interface — superset of the incomplete types shipped
 * with @neslinesli93/qpdf-wasm.
 */
interface EmscriptenFSFull {
  writeFile(path: string, data: Uint8Array): void;
  readFile(path: string): Uint8Array;
  unlink(path: string): void;
}

/** Full QPDF module interface with complete FS bindings. */
interface QpdfModuleFull {
  callMain(args: string[]): number;
  FS: EmscriptenFSFull;
}

/** Correct Emscripten factory signature — locateFile receives (path, prefix). */
type QpdfFactory = (options: {
  locateFile: (path: string, prefix: string) => string;
}) => Promise<QpdfModuleFull>;

// Module singleton — one QPDF instance per worker lifetime.
let modulePromise: Promise<QpdfModuleFull> | null = null;

function getModule(): Promise<QpdfModuleFull> {
  if (!modulePromise) {
    // Cast through `unknown` to bypass the incorrect locateFile signature
    // in the published @neslinesli93/qpdf-wasm type declaration.
    const factory = createQpdfModule as unknown as QpdfFactory;
    modulePromise = factory({
      // `qpdfWasmUrl` is the Vite-resolved, content-hashed, absolute URL to
      // the qpdf.wasm asset — guaranteed to be correct in all environments.
      locateFile: (path: string) =>
        path.endsWith(".wasm") ? qpdfWasmUrl : path,
    });
  }
  return modulePromise;
}

self.onmessage = async (event: MessageEvent) => {
  const { id, type, payload } = event.data as {
    id: string;
    type: string;
    payload: { buffer: ArrayBuffer; password?: string };
  };

  if (type !== "unlock") return;

  try {
    const { buffer, password } = payload;
    const qpdf = await getModule();

    const inputPath = "/input.pdf";
    const outputPath = "/output.pdf";

    // Write input PDF to the Emscripten virtual filesystem
    qpdf.FS.writeFile(inputPath, new Uint8Array(buffer));

    // Build QPDF CLI arguments for decryption
    const args = ["--decrypt"];
    if (password) {
      args.push(`--password=${password}`);
    }
    args.push(inputPath, outputPath);

    const exitCode = qpdf.callMain(args);

    // Always attempt to clean up input, even on failure
    try { qpdf.FS.unlink(inputPath); } catch { /* ignore VFS cleanup errors */ }

    if (exitCode !== 0) {
      throw new Error(
        `QPDF process exited with code ${exitCode}. ` +
        `Please verify the password is correct.`
      );
    }

    const outputData = qpdf.FS.readFile(outputPath);

    // Release VFS memory for the output file
    try { qpdf.FS.unlink(outputPath); } catch { /* ignore VFS cleanup errors */ }

    self.postMessage(
      { id, result: { success: true, data: outputData.buffer } },
      { transfer: [outputData.buffer] }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to unlock the PDF.";
    self.postMessage({ id, result: { success: false, error: message } });
  }
};
