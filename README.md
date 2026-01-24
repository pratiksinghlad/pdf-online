# PDF Online

A **free, fast, and privacy-first** PDF online that runs entirely in your browser.

![Desktop Demo](./demo-desktop.png)
![Mobile Demo](./demo-mobile.png)

## 🔒 Privacy Statement

**Your files never leave your browser.** All PDF processing happens locally on your device using modern web technologies. We do not:

- Upload files to any server
- Track or collect any data
- Use cookies or analytics
- Require sign-up or registration

## ✨ Features

- **Drag & Drop**: Simply drag PDF files onto the page
- **Reorder Files**: Drag to reorder or use keyboard shortcuts
- **Thumbnails**: Preview first page of each PDF
- **Page Count**: See total pages before merging
- **Fast Merging**: Uses Web Workers for background processing
- **Mobile Friendly**: Responsive design with sticky merge button
- **Accessible**: Full keyboard navigation and ARIA labels

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd pdf-merge-pro

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server at http://localhost:5173 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## 📁 Project Structure

```
src/
├── components/          # React UI components
│   ├── Navbar.tsx       # Navigation bar
│   ├── DropZone.tsx     # File drag-and-drop area
│   ├── FileCard.tsx     # Individual file card
│   ├── FileList.tsx     # Sortable file list
│   ├── MergeButton.tsx  # Merge action button with progress
│   └── Footer.tsx       # Page footer
├── context/
│   └── PDFContext.tsx   # State management & merge logic ⭐
├── pages/               # Route pages
│   ├── HomePage.tsx     # Main merge interface
│   ├── AboutPage.tsx    # About & privacy info
│   └── HowItWorksPage.tsx # Technical documentation
├── theme/
│   └── index.ts         # Chakra UI theme configuration
├── types/
│   └── index.ts         # TypeScript interfaces
├── utils/
│   └── index.ts         # Helper functions
├── workers/
│   └── pdfWorker.ts     # Web Worker for PDF operations ⭐
├── App.tsx              # Main app with routing
├── main.tsx             # Entry point
└── index.css            # Global styles
```

### Key Files

| File | Purpose |
|------|---------|
| `src/context/PDFContext.tsx` | Main state management, file handling, thumbnail generation, and orchestrates merge operations |
| `src/workers/pdfWorker.ts` | Web Worker that performs heavy PDF operations (merging, page counting) off the main thread |
| `src/components/FileList.tsx` | Drag-and-drop file reordering with @dnd-kit |

## 🔧 Architecture

### Worker Communication

```
Main Thread                    Web Worker
     │                              │
     │  postMessage (files)         │
     │ ───────────────────────────> │
     │    [Transferable Objects]    │
     │                              │
     │                    [pdf-lib processes]
     │                              │
     │  postMessage (merged PDF)    │
     │ <─────────────────────────── │
     │    [Transferable Objects]    │
```

### Memory Optimization

- **Transferable Objects**: ArrayBuffers are transferred (not copied) to/from workers
- **Lazy Loading**: pdf-lib and pdfjs-dist are dynamically imported only when needed
- **Low-res Thumbnails**: Thumbnails rendered at 96px height for speed
- **Cleanup**: References to large buffers are released after merge

## 🎨 Technology Stack

| Technology | Purpose | License |
|------------|---------|---------|
| React + TypeScript | UI Framework | MIT |
| Vite | Build tool | MIT |
| Chakra UI | Component library | MIT |
| pdf-lib | PDF manipulation | MIT |
| pdfjs-dist | PDF rendering | Apache 2.0 |
| @dnd-kit | Drag and drop | MIT |
| react-dropzone | File drop handling | MIT |
| framer-motion | Animations | MIT |

## ⚠️ Known Limitations

| Limitation | Details |
|------------|---------|
| Large files | Files >50MB may be slow to process |
| Encrypted PDFs | Password-protected PDFs cannot be merged |
| Memory | Very large merges (100+ pages) may require more browser memory |
| Browser support | Modern browsers recommended (Chrome 90+, Firefox 90+, Safari 14+, Edge 90+) |

## ♿ Accessibility

- Full keyboard navigation (Tab, Arrow keys, Enter, Delete)
- ARIA labels on all interactive elements
- Focus indicators
- Screen reader friendly
- Respects `prefers-reduced-motion`

## 📋 Manual Test Checklist

- [ ] Upload 3 PDFs via drag-and-drop
- [ ] Upload PDFs via file picker
- [ ] Paste PDF from clipboard (if supported)
- [ ] Verify thumbnails appear
- [ ] Verify file sizes and page counts shown
- [ ] Reorder files via drag-and-drop (desktop)
- [ ] Reorder files via touch (mobile)
- [ ] Reorder files via keyboard (↑↓ arrows)
- [ ] Move file to top (Home key) and bottom (End key)
- [ ] Remove individual files
- [ ] Clear all files
- [ ] Merge PDFs and verify download
- [ ] Open merged PDF and verify page order
- [ ] Test with encrypted PDF (should show error)
- [ ] Test navigation menu on mobile
- [ ] Visit About and How It Works pages

## 📄 License

MIT License - Feel free to use, modify, and distribute.

---

Made with ❤️ for privacy and simplicity.
