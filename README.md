# PDF Online

PDF Online is a free, privacy-first PDF toolkit for web and desktop. It runs locally in your browser or Tauri desktop shell so your files stay on your device while you merge, compress, protect, unlock, and convert documents.

![Desktop Demo](./demo-desktop.png)
![Mobile Demo](./demo-mobile.png)

## What It Does

- Merge PDFs, images, and text files into a single PDF
- Compress PDFs in the browser with automatic engine fallback
- Convert images to PDF with drag-and-drop page reordering
- Protect PDFs with password encryption
- Unlock password-protected PDFs when you know the password
- Work locally without uploading files to a server

## Privacy

Your files never leave your device.

- No file uploads
- No analytics or tracking
- No account required
- Browser-first processing
- Offline-friendly after the app is loaded

## Main Features

### Merge PDFs, Images, and Text

- Drag and drop files to add them quickly
- Reorder files before export
- Preview thumbnails and page counts
- Merge mixed inputs into one PDF download
- Keyboard-friendly file management

### Compress PDF

- Reduce PDF file size directly in the browser
- Uses Ghostscript WASM when available
- Falls back to canvas-based compression automatically
- Supports multiple files in one session
- Keeps processing on-device

### Image to PDF

- Supports JPG, PNG, GIF, WebP, and BMP
- Reorder images before conversion
- Export one combined PDF

### Protect PDF

- Add password protection to PDF files
- Uses strong client-side encryption
- Supports per-file or batch-style workflows

### Unlock PDF

- Remove password protection when you know the password
- Detects already-unprotected files
- Uses local processing only

## Tech Stack

- React 19
- TypeScript
- Vite
- Chakra UI
- Framer Motion
- pdf-lib
- pdfjs-dist
- jsPDF
- QPDF WASM
- Tauri 2

## Project Structure

```text
src/
  components/         Shared UI building blocks
  context/            Feature state and business logic
  features/           Tool-specific pages and components
  pages/              Static pages like About and How It Works
  services/           Compression and worker orchestration
  utils/              Shared helpers and constants
  workers/            Background PDF processing
src-tauri/
  Tauri desktop configuration and packaging assets
docs/
  Project documentation including Windows Store packaging
```

## Development

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
git clone <repo-url>
cd pdf-online
npm install
```

### Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the web app |
| `npm run preview` | Preview the production build |
| `npm run test` | Run tests with Vitest |
| `npm run lint` | Run ESLint with autofix |
| `npm run tauri:dev` | Run the desktop app in development |
| `npm run tauri:build` | Build the desktop installer |
| `npm run tauri:build:store` | Build the NSIS installer used for Store packaging |
| `npm run msix:build` | Wrap the NSIS installer into MSIX via Microsoft's packaging tool |

## Desktop and Store Packaging

The desktop build targets Tauri with an NSIS installer. For Microsoft Store packaging, this repo uses a free two-step flow:

1. Build the NSIS installer with `npm run tauri:build:store`
2. Convert that installer to `.msix` with Microsoft's MSIX Packaging Tool

The full packaging notes live in [docs/windows-store.md](./docs/windows-store.md).

## Accessibility and UX

- Keyboard navigation across core flows
- Drag-and-drop support
- Clipboard paste support in supported tools
- Responsive layouts for desktop and mobile
- Worker-based processing to keep the UI responsive

## License

MIT
