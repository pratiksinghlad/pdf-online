# Ghostscript WASM Files

Place the following files here for Ghostscript WASM compression:

- `gs.js` - Emscripten JavaScript glue code
- `gs.wasm` - Compiled Ghostscript WebAssembly binary

## How to obtain

1. Clone: `git clone https://github.com/nicbarker/ghostscript-wasm`
2. Or download from: `https://github.com/nicbarker/ghostscript-wasm/releases`
3. Or use the npm package: `npm pack @jspawn/ghostscript-wasm` and extract

Without these files, the compressor automatically falls back to canvas-based
compression which still provides effective image downsampling.
